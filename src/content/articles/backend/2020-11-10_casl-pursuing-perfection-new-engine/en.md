---
title: "CASL. Pursuing Perfection II: New Engine"
author: sstotskyi
categories:
  - backend
  - important
createdAt: 2020-11-10T08:02:00.000Z
meta:
  keywords:
    - casl
    - javascript
    - performance
---

![CASL. UCAST new engine](./casl-v5-engine.png)

This is the second part in the series of articles where I share my experience building and optimizing CASL v5:

<summary-cut/>

* [CASL. Pursuing Perfection I: Why?](../2020-10-20_casl-pursuing-perfection-why)
* **CASL. Pursuing Perfection II: New Engine**
* CASL. Pursuing Perfection III: Big O
* CASL. Pursuing Perfection IV: Type Safety

First time you've heard about CASL? You may want to read "[What is CASL?](https://casl.js.org/v4/en/guide/intro)".

As I said in the previous article, to support SQL databases, CASL needed a new checking engine which can evaluate conditions in runtime and can transform them into any database query language. And **this is why [UCAST](https://github.com/stalniy/ucast) was born!**

But, let's get deeper into what UCAST actually is

## The harness

So, the task is **to translate any language to any other language**. Doesn't it sound familiar? Think for a moment, please.

If we ask Wikipedia ["What is compiler?"](https://en.wikipedia.org/wiki/Compiler), we get:

> In computing, a compiler is a computer program that **translates computer code written in one programming language** (the source language) **into another language** (the target language).

Aha! The task converts  to writing a compiler that can translate MongoDB into JavaScript and SQL. There is a lot of theory around compilers, I knew I could read some of it but it would take a lot of time which I didn't have. That's why I used Wikipedia as a reference :)

So, according to Wikipedia:

> A compiler is likely to perform many or all of the following operations: **preprocessing, lexical analysis, parsing, semantic analysis** (syntax-directed translation), **conversion of input programs to an intermediate representation, code optimization and code generation**.

Quite a lot right? Hopefully, not all are necessary. The most **3 important operations** we need to concentrate at is:

* parsing
* conversion of input programs to an intermediate representation, usually [**A**bstract **S**yntax **T**ree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
* code generation or AST interpreter (we do not always need to generate another code)

So, to translate MongoDB query to something else, it needs to be parsed into an intermediate representation (i.e., AST) which later can be consumed by a code generator (or an interpreter) to do some useful work.

And you know what? All these I've implemented in [@ucast/* ecosystem](https://github.com/stalniy/ucast#ecosystem).

## Abstract Syntax Tree

In spite of the somewhat complex naming, Abstract Syntax Tree is a regular [tree data structure](https://en.wikipedia.org/wiki/Tree_(data_structure)) of objects that contain information about parsed language.

There are 3 classes in [@ucast/core](https://github.com/stalniy/ucast/tree/master/packages/core) package that is used to represent any boolean condition in AST:

* `FieldCondition` represents a condition based on an object's field and operator (e.g., `x === 3` or `{ x: 3 }` in terms of MongoDB)
* `DocumentCondition` represents condition that restricts a document or a row as whole (e.g., `$where` operator in MongoDB query language and `EXISTS` in SQL)
* `CompoundCondition` represents a compound boolean operation (e.g., logical "and", "or", etc). This one aggregates other conditions in itself what allows us to represent complex expressions such as
`(x === 5 && x < 2) || (y > 0 && status === "available")`

## MongoDB query Parser

As we already know, the responsibility of parser is to transform code into AST. And this is exactly what `MongoQueryParser` class from `@ucast/mongo` package does. Basically, the result of its work of is a tree of `FieldCondition`, `DocumentCondition` and `CompoundCondition` objects. The really cool thing which I like about this class is that it's composite and consists of parsing instructions that allows us to:

1. To implement custom operators and extend our own MongoDB-like query language.
2. To restrict what operators can be used in our MongoDB-like query language, to prevent usage of complex conditions.
3. To use only pieces we need and get rid of unused code using JavaScript bundlers (e.g., rollup, webpack).

Let’s see a working example to understand how it works:

```js
import { MongoQueryParser, $eq } from '@ucast/mongo';

const parser = new MongoQueryParser({ $eq });
const ast = parser.parse({
  authorId: 1
});
```

The parser above can parse only `$eq` operator, so if you try to use `$lt` for example, it will throw an error. The produced result is a single object of `FieldCondition` type with `eq` operator. `$eq` is actually a special operator which you need to pass in order to use POJO style query.

To learn more about MongoDB query parser, its optimization logic and customization, please refer to the [**README file of @ucast/mongo**](https://github.com/stalniy/ucast/tree/master/packages/mongo#getting-started).

## Interpreter or Code Generator?

UCAST uses word "interpreter" instead of "code generator" as it more clearly explains its purpose. For example, it may interpret it into JavaScript boolean value or into another language.

There are 2 packages that implements interpreter interface:

* [@ucast/js](https://github.com/stalniy/ucast/blob/master/packages/js) converts AST into boolean value
* [@ucast/sql](https://github.com/stalniy/ucast/blob/master/packages/sql) converts AST into SQL string (also provides integration with major ORM libraries through sub modules)

An interpreter is designed in very similar way to a parser but instead of using parsing instructions, it consists of more granular interpreters (1 per operator). Frankly speaking, **an interpreter is just a pure function that is composed of other pure functions**:

```js
import { createJsInterpreter, eq, lt, gt } from '@ucast/js';

const interpret = createJsInterpreter({ eq, lt, gt });
```

Later, we can use this function to interpret AST into boolean value. So, to mimic [sift.js](https://github.com/crcn/sift.js) functionality all we need to do is to compose MongoDB query parser and JavaScript interpreter:

```js
import { MongoQueryParser, allParsingInstructions } from '@ucast/mongo';
import { createJsInterpreter, allInterpreters } from '@ucast/js';

const parser = new MongoQueryParser(allParsingInstructions);
const interpret = createJsInterpreter(allInterpreters);
const ast = parser.parse({ authorId: 1, status: 'published' });

console.log(interpret(ast, { authorId: 1, status: 'published' })); // true
console.log(interpret(ast, { authorId: 2, status: 'published' })); // false
```

To reduce boilerplate of building MongoDB query language JavaScript runtime interpreter, I created a separate @ucast/mongo2js package which do this for us. [**@ucast/mongo2js**](https://github.com/stalniy/ucast/tree/master/packages/mongo2js) **is a drop-in replacement for sift.js and actually used by casl v5 to evaluate conditions in runtime!** Moreover, it **speeds up conditions evaluation by ~2x times!**

The only difference between @ucast/mongo2js and sift.js is how they interpret equal operation on objects.

```js
import { guard } from '@ucast/mongo2js';
import sift from 'sift';

const test = guard({ author: { id: 1 } });
const sifter = sift({ author: { id: 1 } });

console.log(test({ author: { id: 1 } })) // false
console.log(sifter({ author: { id: 1 } })) // true
```

By default, UCAST doesn’t check deep equality of objects but this can be changed by creating a custom `guard` function and custom `compare` function.

> Refer to documentation of [@ucast/js](https://github.com/stalniy/ucast/tree/master/packages/js) and [@ucast/mongo2js](https://github.com/stalniy/ucast/tree/master/packages/mongo2js) for more details

Usually, you don’t even need such capability because it can be rephrased using dot notation which is supported by ucast as well:

```js
const test = guard({ 'author.id': 1 });
const sifter = sift({ 'author.id': 1 });

console.log(test({ author: { id: 1 } })) // true
console.log(sifter({ author: { id: 1 } })) // true
```

**All UCAST packages are written in TypeScript**, so you additionally get type safety and hints in your IDE.

# Conclusion

UCAST ecosystem is not only fast, lightweight but also very powerful! By implementing different parsers and interpreters, **we can achieve outstanding results by combining one parser with different interpreters and many parsers with one interpreter.**

For example, by implementing [json-schema](https://json-schema.org/) parser, we will be able to reuse existing interpreters and convert the result either to JavaScript boolean value or SQL query or MongoDB query or Cassandra query or REST query or GraphQL query or any query language you can imagine!

**How do you feel about that?** I’m excited.

---

Did I deserve [a cup of coffee](https://opencollective.com/casljs/contribute/barista-13740/checkout)?

---

In the next article, I'll explain what JavaScript optimization technics allowed me to optimize Ability creation **by more than 15x times**! Stay tuned!

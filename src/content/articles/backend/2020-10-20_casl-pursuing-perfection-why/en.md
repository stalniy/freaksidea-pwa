---
title: "CASL. Pursuing Perfection I: Why?"
author: sstotskyi
categories:
  - backend
  - important
createdAt: 2020-10-20T08:02:00.000Z
meta:
  keywords:
    - casl
    - javascript
    - performance
---

![CASL need for SQL](./casl-need-for-sql.jpg)

This is the first part in the series of articles where I plan to share my experience building and optimizing CASL v5:

<summary-cut/>

* **CASL. Pursuing Perfection I: Why?**
* CASL. Pursuing Perfection II: New Engine
* CASL. Pursuing Perfection III: Big O
* CASL. Pursuing Perfection IV: Type Safety

First time you've heard about CASL? You may want to read "[What is CASL?](https://casl.js.org/v4/en/guide/intro)".

## Why?

[The long standing issue](https://github.com/stalniy/casl/issues/8) regarding SQL integration was created 2 months after the initial CASL's release and was not addressed for years. To understand why and why it was a challenge, we need to go back to the days when CASL was designed.

### A bit of history

CASL was heavily inspired by [cancan ruby gem](https://github.com/ryanb/cancan). This gem provides 3 ways to define conditions for rules: 

* hash maps, \
  can be used for runtime checks and can be transformed to SQL query
* ruby blocks, \
  similar to lambdas in other languages, only runtime checks
* `ActiveRecord::Relation` and raw SQL queries

> Why CASL did not inherited the name of "cancan" is a different story but if you are curious, just read [here](https://github.com/vadimdemedes/cancan/issues/28).

Values in hash maps are interpreted as "equal" operation, so `{ author_id: 1 }` is transformed to `post.author_id == 1` in runtime and to `author_id = 1` in SQL.

At that time, I worked with MongoDB and our use-cases were a bit more complex. MongoDB itself allows to store and query a bit more complex data structures than SQL databases (before JSON data type). That's why I decided to use MongoDB query language to define conditions for permissions. But there was another issue: I needed a way to interpret MongoDB in JavaScript. 

And **thanks to [sift.js](https://github.com/crcn/sift.js)**, library that evaluates MongoDB conditions in runtime, the issue was pretty easy to solve :)

Eventually, sift.js was used to interpret conditions in JavaScript and the same conditions, without additional processing were used to query the database. 

As I said, there was no additional preprocessing and it was the main reason why there was no official SQL support.

### So, no SQL at all?

Frankly speaking, **there is a possibility to use CASL with SQL** databases thanks to [sequelize](https://sequelize.org/) which accepts "where" conditions that are pretty similar to MongoDB query language. This works pretty well even today but only for cases when all the data required to check conditions is in a single table.

But as soon as you try to define permissions base on a related table, you are on your own because there is no custom operators support, no AST and no all that stuff which is required for transforming languages from one to another.

## Finally. Solution

To add better SQL support, I decided to go the same road and ask Craig to implement it :) The details of our conversion can be found in [this PR](https://github.com/crcn/sift.js/pull/204).

> Craig is the author of sift.js library and I'd like to say a "Big Thank You" for his awesome work!

Unfortunately, due to how sift.js was internally implemented there was no easy way to change it to the form that would satisfy CASL's requirements. Also a lack of free time didn't allow us to work together effectively.

That's why I decided to implement my own MongoDB query language interpreter, **an interpreter that allows us to use CASL not only with MongoDB but also with SQL, ElasticSearch, Cassandra** and actually whatever is required for your business case!

### Universal Conditions AST (UCAST)

[UCAST](https://github.com/stalniy/ucast) is a new conditions checking engine which was specifically implemented for CASL v5. Despite that fact, it can be used on its own and **its goal is to interpret any conditions to any language**. Some examples:

* to transform MongoDB to JavaScript boolean value. In other words, interpret MongoDB conditions in JavaScript runtime on Plain Old JavaScript Objects 
* **transform MongoDB to SQL!**
* transform [json-schema](https://json-schema.org/) to SQL
* transform MongoDB query to json-schema and vice-versa
* transform an HTTP request to a MongoDB or SQL query

Hopefully, now it's clear that it provides a way **to transform X query to Y query or interpret X query in JavaScript**. How do you feel about this? I'm excited!

## Free Perks

Additionally to database polyglot ability, UCAST makes CASL v5 to check permissions based on attributes in **~2 times faster than in v4**! This was the reason which inspired me to further optimize performance in CASL but this is another story.

If you would like to test this yourself, please use the latest [@casl/ability@5.1.0-next.9](https://github.com/stalniy/casl/releases/tag/%40casl%2Fability%405.1.0-next.9) pre-release version.

---

Did I deserve [a cup of coffee](https://opencollective.com/casljs/contribute/barista-13740/checkout)?

---

More about ucast, compilers and performance improvements, you will find in the next article. Stay tuned!

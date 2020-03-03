import { css, unsafeCSS } from 'lit-element';
import iconIdea from '../assets/icon/idea.jpg';

export default css`
.icon-idea {
  display: inline-block;
  margin-right: 10px;
  background: url(${unsafeCSS(iconIdea)}) no-repeat 0 top;
  vertical-align: middle;
  width: 20px;
  height: 33px;
}

.icon-idea.icon-sm {
  background-image: url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQIDAgECAwMCAgICAwMDAwMDAwMEAwQEBAQDBAQFBgYGBQQHBwgIBwcKCgoKCgwMDAwMDAwMDAz/2wBDAQICAgQDBAcEBAcKCAcICgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAiAAoDAREAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAABAYCAwcJ/8QANxAAAAMFBAYFDQAAAAAAAAAAAQIDAAQFBhESMTJhBxMUFzRTFRYzUlQhNTdBQ0RRcYGDkqHw/8QAGwEAAQUBAQAAAAAAAAAAAAAAAAECAwYIBAX/xAA4EQABAgMDBwYPAAAAAAAAAAABAAIDERIEBTEGMkFRUnGhFTRTYYHwBwgUFxghI0JDYoORsdHh/9oADAMBAAIRAxEAPwDtZF5hfX46kUF7USeymNqkyHMUCAF3kDK9sQZR5X2i3mJbzaokOK15pa1zgGAEykAfVLTPHSrrZ7E1kmUgg4qzetHOWHC/D2vN+eTS+kRe+w3m0sPidNhm9WYm8gwtZzuGpA6QZWOXSM6wtzXBF0i5iqGKAGqBhNZUs0qHqrTNvS8I3i83vfF+utN2RoUOxRiHRAXSe0k+0pbTIzzhoqJGAChu+/4UKBREBL24auqa0LqjLvhy8L0d9juNo7zb3N0DebeTfR2d/wA2Kr/KMba96rt17ktx2ao8o7hNMNUQBzQMbZklEyGNYEKDUxgthaC+yLXpcSjv1gnKHgtsxe8cm79sygbWnX/UsjwmkTSHCZ4hc+BIUESMeGRFQhnJYa6sia5hAbY1qFg1foz0i0XczK/eP5u6JuLf4i7HmxV+JIk7h3G5Dzl6YZe7DAPaY8Sn8XOrCE8/iyfrv2KP7L//2Q==');
  width: 10px;
  height: 17px;
}

a:visited .icon-idea,
.icon-idea.is-off {
  background-position: 0 bottom;
}

.icon-comment {
  display: inline-block;
  background-image: url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQIDAgECAwMCAgICAwMDAwMDAwMEAwQEBAQDBAQFBgYGBQQHBwgIBwcKCgoKCgwMDAwMDAwMDAz/2wBDAQICAgQDBAcEBAcKCAcICgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAQAA8DAREAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAgQFCf/EACQQAAMAAgEDAwUAAAAAAAAAAAECAwQFEQASFQYTIRQiMlGR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDczG0Wvpg49UwIuzzDu/j43LMSeSXZlJPRAbLQ69Na1G18VqLYiofHRkfuypqQOGPdyDwR8c9BVl6ZzVhOOTHDu819taUFe4qCSOf70CWfrcx86WgXXwxpZBnX6hBSsanHsLGZKgFO5VH5D9jk/BIf/9k=');
  background-repeat: no-repeat;
  background-position: 0 center;
  width: 15px;
  height: 17px;
  vertical-align: middle;
}
`;

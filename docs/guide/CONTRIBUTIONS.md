# Contributions guide

## Get to know the tools

We use Meteor for the backend and React Native with expo for the app. 
In order to make useful contributions it is good to know these tools.

Here are some reasources for these tools:

### Meteor

- https://guide.meteor.com/ (official guide with multiple topics)
- https://docs.meteor.com/ (API docs for Meteor)

### React Native and Expo

- https://reactnative.dev/
- https://docs.expo.dev/
- https://reactnativeelements.com/ (we use this for some UI components)
- https://github.com/TheRealNate/meteor-react-native (used to connect with the backend)

## Commit Messages

We "should" use the following commit convention, if possible:

```
type(target): what has been done
```

where `type` is one of `feature`, `fix`, `docs`, `ci`, `refactor` or `update` and
`target` is one of `backend` or `app` or is left out.

However, there will no one be blamed, in case this has been forgotten. 
Just please, try to avoid non-explanatory or generic commit messages like `updated code` or
`fixed bug`. Good commit messages can help us find previous work fast and efficient.

## Branching Strategy

There has to be a branch for each new addition. Best is to name the branches like the `type`, for example:

- `feature-add-xyz`
- `fix-this-and-that`
- `docs-update-guide`
- `refactor-app-screens`

However, there will no one be blamed, in case this has been forgotten.


## JavaScript code style

We use standard js as our linter. Read more about it here: https://standardjs.com
Make sure you run the linter in backend and app, before pushing your commits!


## Documentation style

We intend to build an extensive documentation. 
The documentation should be split into [guide](./) and [api docs](../api).

### Guide

The guide provides overall information on topics that exceed specific parts of the code.
We use markdown for the guide, where one file is created for one topic. 

Read more on how to use markdown here:

You can also use the markdown cheatsheet from here:

#### Bash scripts and terminal commands

Sometimes the markdown files may contain terminal commands. 
They should be **highighted using bash and indicate a new line with a dollar sign:**:

<pre><code>```bash
$ meteor npm install
```</code></pre>

which will create the following:

```bash
$ meteor npm install
```

#### Code snippets

If you want to include code snippets, please use the `js`, `html` or `css` highlighters. Some examples:

<pre><code>```js
const foo = 'foo'
const bar = 'bar'
const fooBar = `${foo}-${bar}`
```</code></pre>

will create the following:

```js
const foo = 'foo'
const bar = 'bar'
const fooBar = `${foo}-${bar}`
```

### API Docs

The api docs instead are intended to document the code that is used by the developers and where
it's understanding of input, output and behaviour is crucial.

The following pattern for documenting should be favoured:

```js
/**
 * An exmaple component to be used in xyz situations.
 */
export const Example = {}

/**
 * Glues foo and bar together into a single string.
 * 
 * @param foo {string} the foo from whereever
 * @param bar {string} the bar to be added
 * @returns {string} the glued string
 * @example
 * const foo = 'foo'
 * const bar = 'bar'
 * const glued = Example.glue({ foo, bar }
 */
Example.glue = function ({ foo, bar }) {
  // use double-slash for inline-comments when 
  // - code is not self-explanatory enough or 
  // - if parts of the code are important to understand or 
  // - if extra knowledge is required to understand this code or
  // - you want to give a reason WHY you chose a specific implementation or another
  return `${foo}-${bar}`
}
```

The `@example` is only necessary if the usage is specific or complex and you want to provide
guidance for devs.

## Testing

The backend uses `mocha`, `chai` and `sinon` for testing, while the app uses `jest`.
Make sure to get deeper into their documentation in order to know how to write tests.

Also, make sure to run the backend and app tests, before pushing your commits to the server.

Here are some further resources on the testing tools:

### Backend tests

- https://github.com/Meteor-Community-Packages/meteor-mocha
- https://www.chaijs.com/
- https://sinonjs.org/


### App tests

- https://docs.expo.dev/guides/testing-with-jest/
- https://jestjs.io/

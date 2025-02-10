---
title: "Data Flow"
emoji: "🔄"
description: "Passing state, events, context"
---

<section class="hero">

# 🔄 Data Flow

<p class="lead"></p>
</section>

<section>

## Passing State Down

Let's consider a parent component called `TodoApp` that coordinates an inner component called `TodoList`. `TodoApp` needs to be able to add new tasks to the `TodoList` and modify how it is filtered.

### Parent Component: TodoApp

```js
class TodoApp extends UIElement {

}
TodoApp.define('todo-app');
```

### Child Component: TodoList

```js
class TodoList extends UIElement {

}
TodoApp.define('todo-list');
```

</section>

<section>

## Events Bubbling Up



</section>

<section>

## Providing Context



</section>

<section>

## Consuming Context



</section>
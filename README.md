<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [clientRender][1]
    -   [Parameters][2]
-   [serverRender][3]
    -   [Parameters][4]
-   [appComposer][5]
    -   [Parameters][6]

## clientRender

The entry point for the client-side bundle.

### Parameters

-   `configureStore` **[Function][7]** Creates the store object.
-   `render` **[Function][7]** Renders the app, once the DOM is loaded.

Returns **[Object][8]** The store used to create the app.

## serverRender

The entry point for the server-side bundle.

### Parameters

-   `configureStore` **[Function][7]** Creates the store object.
-   `render` **[Function][7]** Creates the rendered app output.

Returns **[Function][7]** Takes arugments (request, errback). When invoked, will either run the render or the errback.

## appComposer

Wraps the app in a function. This wraooer takes the arguments store, and history. The returned function returns the app with these arguments as props.

### Parameters

-   `App` **[Object][8]** The component to wrap.

Returns **[Function][7]** Takes the arguments (store, history, ...rest). Returns the app using these as props.

[1]: #clientrender

[2]: #parameters

[3]: #serverrender

[4]: #parameters-1

[5]: #appcomposer

[6]: #parameters-2

[7]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[8]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

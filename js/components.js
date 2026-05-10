/**
 * SOMA.AI Component Registry
 * ─────────────────────────────────────────────────────────────
 * A lightweight Vanilla JS component system.
 *
 * Mental model mirrors React functional components:
 *   React:  const CommandBar = (props) => <div>...</div>
 *   SOMA:   SOMA.register('CommandBar', (props) => `<div>...</div>`)
 *
 * React migration path:
 *   - SOMA.register()  →  React component definition
 *   - SOMA.renderAll() →  ReactDOM.createRoot().render()
 *   - data-component   →  JSX component tag <CommandBar />
 *   - props object     →  identical — same keys, same values
 *
 * Every component written here can be copy-pasted into React
 * with only a syntax change (template literal → JSX).
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};

// Internal registry: { ComponentName: renderFunction }
SOMA.components = {};

/**
 * Register a component.
 *
 * @param {string}   name     - Matches the data-component="..." attribute
 * @param {function} renderFn - (props: object) => HTML string
 *
 * Example:
 *   SOMA.register('StatCard', (props) => `<div>${props.value}</div>`);
 */
SOMA.register = function (name, renderFn) {
    SOMA.components[name] = renderFn;
};

/**
 * Imperatively render a component into a specific DOM element.
 * Use this when you need to render a component programmatically
 * rather than via a data-component placeholder.
 *
 * @param {string} name     - Registered component name
 * @param {object} props    - Props to pass into the render function
 * @param {string} selector - CSS selector for the mount point
 */
SOMA.render = function (name, props, selector) {
    const component = SOMA.components[name];
    if (!component) {
        console.warn('[SOMA] Component not registered:', name);
        return;
    }
    const target = document.querySelector(selector);
    if (!target) {
        console.warn('[SOMA] Mount point not found:', selector);
        return;
    }
    target.innerHTML = component(props || {});
};

/**
 * Scan the DOM for all [data-component] elements and render them.
 * Called once on page load (in app.js, before showView).
 *
 * Props are read automatically from data-* attributes:
 *   <div data-component="StatCard" data-value="98.4%" data-label="BIM Health">
 *   → props = { value: '98.4%', label: 'BIM Health' }
 *
 * Attribute naming: data-my-prop → props.myProp (auto camelCased)
 */
SOMA.renderAll = function () {
    let components = document.querySelectorAll('[data-component]');
    
    // Continue rendering until no more data-component placeholders are left
    // This allows parents to render their children, and then those children to be processed
    while (components.length > 0) {
        const el = components[0];
        const name = el.getAttribute('data-component');
        const component = SOMA.components[name];

        if (!component) {
            console.warn('[SOMA] No component registered for:', name);
            // Mark as processed but failed so we don't loop forever
            el.removeAttribute('data-component');
            el.setAttribute('data-component-failed', name);
            components = document.querySelectorAll('[data-component]');
            continue;
        }

        // Collect data-* attributes as props
        const props = {};
        Array.from(el.attributes).forEach(function (attr) {
            if (attr.name === 'data-component') return;
            if (!attr.name.startsWith('data-')) return;

            const key = attr.name
                .slice(5)
                .replace(/-([a-z])/g, function (_, char) {
                    return char.toUpperCase();
                });

            props[key] = attr.value;
        });

        // Capture inner HTML as content prop
        props.content = el.innerHTML.trim();

        // Render component
        const temp = document.createElement('div');
        temp.innerHTML = component(props).trim();

        if (temp.firstElementChild && temp.children.length === 1) {
            if (el.id) temp.firstElementChild.id = el.id;
            el.replaceWith(temp.firstElementChild);
        } else {
            el.removeAttribute('data-component'); // Prevent infinite loop
            el.innerHTML = temp.innerHTML;
        }

        // Re-query for remaining components
        components = document.querySelectorAll('[data-component]');
    }
};
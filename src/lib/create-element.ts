const attributesHandler = <E extends HTMLElement | SVGElement, K extends keyof (HTMLElementEventMap | SVGElementEventMap)>(element: E, ...attribs: (
    string | {
        eventListeners?: ({
            type: K;
            listener: (ev: HTMLElementEventMap[K] | SVGElementEventMap[K]) => any;
            options?: (boolean | AddEventListenerOptions);
        })[],
        children?: (null | Element | string)[] | string
        attributes?: { [qName: string]: string | number }
    })[]) => {
    for (const attribute of attribs) {
        if (!attribute) continue;
        if (typeof attribute === "string") {
            let [qualifiedName, value] = attribute.split("=");
            if (!qualifiedName) continue;
            if (qualifiedName === "content") {
                element.textContent = value + "";
            } else {
                element.setAttribute(qualifiedName, value + "");
            }
            continue;
        }
        if (attribute.eventListeners) {
            for (const { type, listener, options } of attribute.eventListeners) {
                if (element instanceof SVGElement) {
                    element.addEventListener(type, listener, options);
                } else if (element instanceof HTMLElement) {
                    element.addEventListener(type, listener, options);
                }
            }
        }
        if (attribute.children) {
            if (typeof attribute.children  == "string")  {
                element.innerHTML = attribute.children
            } else {
                for (const child of attribute.children) {
                    if (!child) continue;
                    else if (typeof child === "string") element.textContent = child;
                    else if (typeof child === "object" && child.nodeName) element.appendChild(child);
                }
            }
        }
        if (attribute.attributes) {
            for (const qName in attribute.attributes) {
                element.setAttribute(qName, attribute.attributes[qName] + "")
            }
        }
    }
}


export const createElement = (
    parent: null | HTMLElement,
    elemName: string,
    ...attributes: Parameters<typeof attributesHandler>[1][]
) => {
    const element = document.createElement(elemName);

    attributesHandler(element, ...attributes);

    if (parent) {
        parent.appendChild(element);
    };

    return element;
};

export const createElementNS = (
    parent: null | HTMLElement | SVGElement,
    elemName: string,
    ...attributes: Parameters<typeof attributesHandler>[1][]
) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", elemName);

    attributesHandler(element, ...attributes);

    if (parent) {
        parent.appendChild(element);
    };

    return element;
};
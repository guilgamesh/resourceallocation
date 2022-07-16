class OrganizationControl {

    static ResourceNameClass            = 'resource-name';

    static OrganizationClass            = 'organization-container';

    static OrganizationChildrenClass    = 'organization-children';

    static ChildrenVisibleClass         = 'children-visible';

    static ChildrenHiddenClass          = 'children-hidden';

    static ExpandCollapseClass          = 'expand-collapse-control';

    static ResourceBoxClass             = 'resource-box';

    #organization;

    #childrenContainer;

    #childControls;

    #parentElement;

    #control;

    constructor(organization, parentId) {
        this.#organization = organization;
        this._renderOrganization(parentId);
    }

    _renderOrganization(parentId) {
        this.#parentElement = document.getElementById(parentId);
        this.#control = this._createOrganizationContainer();
        this.#parentElement.appendChild(this.#control);

        this.#childrenContainer = this._createChildrenContainer();
        this.#control.appendChild(this.#childrenContainer);
    
        this.#childControls = []
        for(let childOrg of this.#organization.children) {
            let childControl = new OrganizationControl(childOrg, this.#childrenContainer.id);
            this.#childControls.push(childControl);
        }
    }

    _createChildrenContainer() {
        let container = document.createElement('div');
        container.id = `children-container-${this.#organization.id}`;
        container.classList.add(OrganizationControl.OrganizationChildrenClass);
        container.classList.toggle(OrganizationControl.ChildrenHiddenClass);

        return container;
    }

    _createOrganizationContainer() {
        let container = document.createElement('div');
        container.id = `container-${this.#organization.id}`;
        container.className = OrganizationControl.OrganizationClass;

        container.appendChild(this._resourceBox());

        return container;
    }

    _resourceBox() {
        let rb = document.createElement('div');
        rb.id = `${OrganizationControl.ResourceBoxClass}-${this.#organization.id}`;
        rb.className = `${OrganizationControl.ResourceBoxClass}`;
        rb.appendChild(this._resourceParagraph());

        if(this.#organization.children.length > 0)
            rb.appendChild(this._expandCollapseControl());

        return rb;
    }

    _resourceParagraph() {
        let p = document.createElement('p');
        p.id = `resource-${this.#organization.id}`;
        let text = `${this.#organization.name}`;
        if(this.#organization.childCount > 0) {
            text += `(${this.#organization.descendantCount}, ${this.#organization.childCount})`;
        }
        p.innerHTML = text;
        p.className = OrganizationControl.ResourceNameClass;

        return p;
    }

    _expandCollapseControl() {
        let e = document.createElement('span');
        e.id = `expand-collapse-${this.#organization.id}`;
        e.innerHTML = 'expand_more';
        e.classList.add(OrganizationControl.ExpandCollapseClass);
        e.classList.add('material-icons');

        e.onclick = this._onExpandCollapse.bind(this);

        return e;
    }

    _expandCollapseControlOld() {
        let e = document.createElement('p');
        e.id = `expand-collapse-${this.#organization.id}`;
        e.innerHTML = this.#organization.expanded ? '-' : '+';
        e.className = OrganizationControl.ExpandCollapseClass;
        e.onclick = this._onExpandCollapse.bind(this);

        return e;
    }

    _onExpandCollapse(event) {
        let label = event.target.innerHTML;
        if(label === 'expand_more') {
            this.showChildren();
        } else { // 'Expand Less'
            this.hideDescendants();
        };
    }

    get control() {
        return this.#control;
    }

    get parentElement() {
        return this.#parentElement;
    }

    get childControls() {
        return this.#childControls;
    }

    get childrenContainer() {
        return this.#childrenContainer;
    }

    hideDescendants() {
        if(this.#childControls.length > 0) {
            this.hideChildren();
            for(let child of this.#childControls) {
                child.hideDescendants();
            }
        }
    }

    hideChildren() {
        if(this.#childControls.length > 0) {
            this.control.children[0].children[1].innerHTML = 'expand_more';
            this.#childrenContainer.classList.add(OrganizationControl.ChildrenHiddenClass);
        }
    }

    showChildren() {
        this.control.children[0].children[1].innerHTML = 'expand_less';
        this.#childrenContainer.classList.remove(OrganizationControl.ChildrenHiddenClass);
    }
}

export { OrganizationControl };
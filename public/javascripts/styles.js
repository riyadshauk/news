const componentItem = (component, item) => `${component}-${item}`;

export const favorite = {
  menu: 'SideNav',
  item: 'item',
  get menuItem() {
    return componentItem(this.menu, this.item);
  },
};

export const article = favorite;

export const SVGButton = {
  selected: 'SVGButton--selected',
};
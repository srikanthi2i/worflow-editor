const removeAllChildren = (item) => {
  while (item && item.firstChild) {
    item.removeChild(item.firstChild);
  }
};

export { 
    removeAllChildren
};

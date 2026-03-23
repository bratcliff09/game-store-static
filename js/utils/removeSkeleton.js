//Remove the skeleton UI class from the given element
const SKELETON_UI_CLASS = "skeleton";

export function removeSkeleton(domElement) {
  domElement.classList.remove(SKELETON_UI_CLASS);
}

export function examplePreInit() {
  // The following example needs to be run as soon as possible to be injected into as many event listeners as possible.
  // This way it will prevent the pesky "Are you sure you want to leave this page?" dialog from showing up when you navigate away from the page.
  unsafeWindow.BYTM.UserUtils.interceptWindowEvent("beforeunload", () => true);
}

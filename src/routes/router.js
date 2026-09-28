export function currentRoute() {
  return location.hash.replace('#/', '') || 'home';
}

export function navigate(route) {
  location.hash = `/${route}`;
}

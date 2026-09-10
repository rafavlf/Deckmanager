// Bridge minimo para persistencia nativa no Android WebView.
// As demais bridges (Browser/Export) permanecem nas features por enquanto.

function hasNativeBridge() {
  return typeof window.AndroidStorage !== 'undefined';
}
function nativeGet(key) {
  try { return window.AndroidStorage.load(key); } catch(e) { return null; }
}
function nativeSet(key, value) {
  try { window.AndroidStorage.save(key, value); } catch(e) {}
}

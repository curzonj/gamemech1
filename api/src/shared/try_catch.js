export default function(fn, alt) {
    try {
        return fn();
    } catch (e) {
        return alt;
    }
}
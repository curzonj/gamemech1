// I'll import it as elvis because I don't like getSafe, get is not descriptive enough
// and the named of the ?. operator is the elvis operator. Not sure why.
// safe is another acceptable function name
export default function(fn, alt) {
    try {
        return fn();
    } catch (e) {
        return alt;
    }
}
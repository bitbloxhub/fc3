tsc lib.ts --module es6 --target es6
tsc audiogen.ts --module es6 --target es6
terser lib.js -o lib.min.js
terser audiogen.js -o audiogen.min.js
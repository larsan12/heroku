var a = {
	a: "Aaa",
	b: "bbb"
}

var b = {
	a: "Aaa",
	b: "bbb"
}

var c = {
	a: "Aaa",
	b: "bbb"
}

var arr1 = [a,b,c];
var arr2 = arr1.slice();

arr2[2].a = "!!!!!!!!!!1";

console.log(JSON.stringify(arr1));
console.log(JSON.stringify(arr2));
console.log(a);
console.log(b);
console.log(c);

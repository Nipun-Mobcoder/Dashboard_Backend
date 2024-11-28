
var b = 15;
const fun = async () => {
    var promise1 = new Promise(function (resolve, reject) {
        setTimeout(resolve, 500, "one");
      });
      var promise2 = new Promise(function (resolve, reject) {
        setTimeout(resolve, 0, "two");
      });
      setTimeout(() => console.log("Hello World"), 0)
      await Promise.all([promise1, promise2]).then(function (value) {
        console.log(value);
    });
    }
fun();
function rest(s, ...c) {
    console.log(b, s , c)
    }
    rest(10,11,20)
class Vehicle {
    constructor(name) {
        this.name = name;
    }
    
    start() {
        console.log(`${this.name} vehicle started`);
    }
}
    
class Car extends Vehicle {
    start() {
        console.log("Global: ", this)
        console.log(`${this.name} car started`);
        super.start();
    }   
}

var above; let down;
console.log("values are: ", above,  down);
above = 10, down = 12;
    
var car = new Car("BMW");
// console.log(car.userName, car.val)
Object.defineProperties(car, {
    'property1': {
        value: 'Four wheelers',
        writable: true,
        enumerable: true,
        configurable: true
    },
    'property2': {
        value: 'Automatic',
        writable: false,
        enumerable: true,
        configurable: true
    }
    }
)
Vehicle.prototype.property3 = "Hello"
car.property1 = 'Two wheelers'
console.log("car's property1 " ,car.property1, "car's property2 " ,car.property2, "car's property3 " ,car.property3)
car.start()

const value = '{"number": 1,"name": "Nipun"}'; 
const jsonVal = JSON.parse(value)
console.log(jsonVal.name)
var mainString = "hello@gmail.com",
regex = /^[^\W_]+\w*(?:[.-]\w*)*[^\W_]+@[^\W_]+(?:[.-]?\w*[^\W_]+)*(?:\.[^\W_]{2,})$/;
console.log(regex.test(mainString));
const a = {b: 10, a: 1}

function fun1() {
    console.log(arguments.length);
}
const k = fun1(1,2,3,4)

const arr1 = [1, 2, 3, 4, 5];
const arr2 = [1, 2, 3, 4, 5];

const checkEqual = (val, i) => {
    return val === arr2[i];
}

console.log("equal = ",(arr1.length === arr2.length) &&
    (arr1.every(checkEqual)))

console.log("max is: ",Math.max(...arr1))

function outerFunction(outerVariable) {
    return (innerVariable) => {
      console.log("Outer Variable:", outerVariable);
      console.log("Inner Variable:", innerVariable);
    };
  }
  
  const closure = outerFunction("I'm from the outer scope");
  closure("I'm from the inner scope");

for (var i = 0; i < 4; i++) {
    console.log(i)
    setTimeout(() => console.log("The index is: ",i))
}

const memoizeAddition = () => {
    let cache = {};
    return (value) => {
      if (value in cache) {
        console.log("Fetching from cache");
        return cache[value]; 
      } else {
        console.log("Calculating result");
        let result = value + 20;
        cache[value] = result;
        return result;
      }
    };
  };
  const addition = memoizeAddition();
  console.log(addition(20));
  console.log(addition(20));
const word = "WoRd";
let result = "";
for( var w of word ){
    if(w.charCodeAt() >= 65 && w.charCodeAt() <= 90) result += w.toLowerCase();
    else result += w;
}
console.log(result)
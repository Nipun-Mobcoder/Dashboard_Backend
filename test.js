
var b = 15;
const fun = async () => {
    var promise1 = new Promise(function (resolve, reject) {
        setTimeout(resolve, 0, "one");
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
        console.log(`${this.name} car started`);
        super.start();
    }   
}
    
var car = new Car("BMW");
console.log(car.userName, car.val)
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

car.property1 = 'Two wheelers'
console.log("car's property1 " ,car.property1, "car's property2 " ,car.property2)
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

for (var i = 0; i < 4; i++) {
    console.log(i)
    setTimeout(() => console.log("The index is: ",i))
}
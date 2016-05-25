// function a(p,a,c,k,e,d){
//     e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};
//     if(!''.replace(/^/,String)){
//         while(c--){
//             d[e(c)]=k[c]||e(c)
//         }
//         k=[function(e){return d[e]}];
//         e=function(){return'\\w+'};
//         c=1
//     };
//     while(c--){
//         if(k[c]){
//             p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])
//         }
//     }
//     return p
// }('y s=s=\'["c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/x.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/A.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/w.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/t.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/u.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/v.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/z.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/I.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/G.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/H.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/F.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/B.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/E.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/C.b","c\\/%0%j%9%0%h%8%f%e%7%0%a%9%1%8%d%6%i%m%6%r%p%1%7%4%2%3%4%2%l%5%1%3%5%g\\/%2%o%k%0%n%q\\/D.b"]\';',45,45,'E8|E9|E7|9A|84|BE|E6|9B|BD|85|80|jpg||90|8A|E5|20|83|9C|B6|AC175|81|A8|AF|AC|A0|9D|A5|pages|JOJO_004|JOJO_005|JOJO_006|JOJO_003|JOJO_001|var|JOJO_007|JOJO_002|JOJO_012|JOJO_014|JOJO_015|JOJO_013|JOJO_011|JOJO_009|JOJO_010|JOJO_008'.split('|'),0,{})

// (function(a){console.log(a);})('123');
// 'use strict';
// new Promise(function(resolve, reject){
    // console.log("test");
// })

var p = Promise.resolve();
function chain(func) {
    p = p.then(() => {
        return new Promise(func);
    });
}



var times = [1000,2000,3000,4000, 1000];
// times.each(function(i){
//     console.log(i);
// });
// console.log("enter0");
var j = 0;
// for (var i = 0; i < times.length; i++) {
//     chain(function(resolve, reject){
//             // console.log("enter",i);
//             setTimeout(() => {
//                 // process.stdout.write("received: " + j + "\x1B[0G");
//                 process.stdout.write('\033[0G'); process.stdout.write('newstuff' + (j++));
//                 resolve(i);
//             },
//             times[i]);
//     });
setInterval(function() {
        // process.stdout.write("received: " + j + "\x1B[0G");
        process.stdout.write('\x1B[0G'); process.stdout.write('newstuff' + (j++));
}, 1000);
//     p = p.then(
// // function(li){
//         () => {
//             return new Promise(function(resolve, reject){
//             // var li = i;
//             console.log("enter",i);
//             setTimeout(() => {
//                 console.log('finish ' + i);
//                 resolve(i);
//             },
//             times[i]);
//         })
//     }
// }(i)
// )
// }


// p2.then(result => console.log(result))
// p2.catch(error => console.log(error))

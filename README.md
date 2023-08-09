# Type Inference

This is a bare-bones type inference implementation.

It also includes a REPL (well, a 'type-REPL' - we can't actually execute the code just yet) and parser for the language we are inferring types of.

This code was written for a talk: "Type Inference Explained (With Typescript, not maths)"

It's heavily inspired by the f(by)19 talk: [Type Inference From Scratch](https://www.youtube.com/watch?v=ytPAlhnAKro)
The code for this talk by: Christoph Hegemann can be viewed [here](https://github.com/kritzcreek/fby19/tree/master).

Christopher's talk really helped me get a grasp how how type inference works, and the Haskell implementation helped me immensely with writing this same algorithm in TypeScript.

This talk for which I'll upload slides and videos (once I've actually given the talk) is a slight simplification on Christopher's talk and approaches this topic assuming no knowledge of Haskell, and tries to keep scary words and type theory out of scope. This does mean that it's a little less complete, and has some theoretical gaps, but I hope it gives a good intuition for type inference and makes it seem more approachable for people who haven't devlved much into this area.


## Running

```
$ npm install
$ npm install -g ts-node
$ ts-node repl.ts
 >  (x) => x
T -> T

 >  "abc"
String

 >  intToString(4)
String

 >  let a = 4;
 .. let addFour = add(a);
 .. addFour(6)
Int

 > <Ctrl+C>
```
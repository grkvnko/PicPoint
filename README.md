# PicPoint.js
A simple JavaScript library for creating points flying in orbit from a picture.

Usage:
```html
<div id="picpoint">
    <img src="image.png">
</div>
```  

```javascript
picpoint = new PicPoint({
    id: "picpoint",
    dotSize: 4,
    radOrbit: { X:80, Y:80, Z:120, Access:120 }
});
```
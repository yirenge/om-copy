
var baseInput="/Users/brain/workhome/app/cw3";
var baseDest="/Users/brain/workhome/app/cw3-copy";
module.exports = {
    source:"**", 
    destination:baseDest, 
    exclude:"**/node_modules/**",
    option:{
        ignore:"**/node_modules/**",
        cwd:baseInput
    }

};
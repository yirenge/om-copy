
var baseInput="/Users/brain/workhome/app";
var baseDest="/Users/brain/workhome/app-copy";
module.exports = {
    source:"**", 
    destination:baseDest, 
    exclude:"**/node_modules/**",
    option:{
        ignore:"**/node_modules/**",
        cwd:baseInput
    }

};
//create mini express app
const exp=require('express')
const userApi=exp.Router();
const expressErrorHandler=require("express-async-handler")
const bcryptjs=require("bcryptjs")
const jwt=require("jsonwebtoken")


//add body parsing middleware
userApi.use(exp.json())


//import mongo client
const mc=require("mongodb").MongoClient;

//connection string
const databaseUrl="mongodb+srv://dbuser:Juser@1610@clusterj0.zv0ho.mongodb.net/mydb?retryWrites=true&w=majority"

let databaseObj;
let userCollectionObject;

//connect to data base
mc.connect(databaseUrl,{useNewUrlParser:true,useUnifiedTopology:true},(err,client)=>{

    if(err){
        console.log("err in db connection ",err)
    }
    else{
        //get database object 
        databaseObj=client.db("mydb")
        //create usercollection object
        userCollectionObject = databaseObj.collection("usercollection")
        console.log("connected to database")
    }

})



//GET http://localhost:3000/user/getusers
userApi.get('/getusers', expressErrorHandler(async (req,res)=>{

    let usersList= await userCollectionObject.find().toArray()
    res.send({message:usersList})
}))



//GET http://localhost:3000/user/getuser/<username>
userApi.get('/getuser/:username', expressErrorHandler(async(req,res,next)=>{

    let un=req.params.username

    let user= await userCollectionObject.findOne({username:un})

    if(user==null){
        res.send({message:"user doesn't exist"})
    }
    else{
        res.send({message:user})
    }


}))




//POST http://localhost:3000/user/createuser
userApi.post('/createuser', expressErrorHandler(async (req,res,next)=>{

    let newUser=req.body

    let user = await userCollectionObject.findOne({username:newUser.username})
    if(user!=null){
        res.send({message:"user already exists"})
    }
    else{
        //hash password
        let hashesPwd=await bcryptjs.hash(newUser.password,7)
        //replace password
        newUser.password=hashesPwd
        //insert
        await userCollectionObject.insertOne(newUser)
        res.send({message:"user created"})
    }
}))




//PUT http://localhost:3000/user/updateuser/<username>
userApi.put('/updateuser/:username', expressErrorHandler(async (req,res)=>{

    let modUser = req.body
    modUser.password=await bcryptjs.hash(modUser.password,7)

    await userCollectionObject.updateOne({username:modUser.username},{$set:{...modUser}})
    res.send({message:"user updated"})
}))

//DELETE http://localhost:3000/user/deleteuser/<username>
userApi.delete('/deleteuser/:username', expressErrorHandler(async (req,res,next)=>{

    let un = req.params.username;
    
    let user = await userCollectionObject.findOne({username:un})

    if(user==null){
        res.send({message:"User doesn't exist"})
    }
    else{
        await userCollectionObject.deleteOne({username:un})
        res.send({message:"user deleted"})
    }
}))

//user login
userApi.post('/login',expressErrorHandler(async (req,res)=>{

    //get credentials
    let credentials=req.body

    //search user by username
    let user= await userCollectionObject.findOne({username:credentials.username})
    if(user==null){
        res.send({message:"Invalid Username"})
    }
    else{
        //compare the password
        let result = await bcryptjs.compare(credentials.password,user.password)
        //if password doesn't match
        if(result==false){
            res.send({message:"Invalid password"})
        }
        else{
            //create token
            let signedToken = jwt.sign({username:credentials.username},'abcdef',{expiresIn:100})
            //send token to client
            res.send({message:"Successful Login",token:signedToken,username:credentials.username,userObj:user})
        }
    }
}))











//exporting api
module.exports=userApi;
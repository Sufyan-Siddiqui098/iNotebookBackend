const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator"); //validating the data like min-length/max-lengthx
const bcrypt = require('bcryptjs');                       //use this to protect the password from hackers
const jwt = require('jsonwebtoken');                      //use this to give a token to a user when creating account then whenever the user login we use this token to verify the correct user
const fetchuser = require("../middleware/fetchuser");


const JWT_SECRET = "secret@string0";

//ROUTE : 1 Creating a User using: POST "/api/auth/createuser". Doesn't require Authentication
router.post(
  "/createuser",
  [
    //body('string', 'Message to be display on error')
    body("email", "Enter valid Email").isEmail(),
    body("name", "Enter a valid Name").isLength({ min: 3 }),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);  //Extracts the validation errors of an express request
    let success = false ;
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //use try catch to avoid code block in case an error occured
    try {

      //checking for the duplicate email
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({success, error: "Sorry this user with this email already exist" });
      }

      const salt = await bcrypt.genSalt(10);     //returns promise-- to avoid promise use "genSaltSync"  method        
      const password = await bcrypt.hash(req.body.password, salt); //returns promise -- creating hash of the password 

      //otherwise it'll create a user
      user = await User.create({   //----because this is the promise
        name: req.body.name,
        password: password,       //---- storing hash of the password
        email: req.body.email,
      });
      const data = {
        user:{
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({success,authtoken})   //With ES6 this is equal to res.json({authtoken: authtoken}) -- this is the token we'll be using to verify user
      // res.json(user);
    } 
    catch (error) {
      console.error(error.message)
      res.status(500).send("Some error Occured ! ");
    }
    // .then(user => res.json(user))
    // .catch(err=>{ //used for error handling and making user know the error [optional]
    //   console.log(err)
    //   res.json({error: "Please Enter Unique value", msg: err.message}) //err.message should be written like this
    // }) //---changed this to async & await
  }
);


//ROUTE: 2 Authenticating user to login using: POST "/api/auth/login". Doesn't require Authentication
router.post(
  "/login",
  [
    //body('string', 'Message to be display on error')
    body("email", "Enter valid Email").isEmail(),
    body('password', "Password cannot be blank").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {email, password} = req.body;
    let success = false;
    try {
      let user = await User.findOne({email}) //finding email:email using {email}
      if(!user ){
        return res.status(400).json({success, error: "Please login with correct credentials"})
      }
      const passwordCmopare = await bcrypt.compare(password, user.password); //Comparing the inputed password with the stored(in DB) password
      if(!passwordCmopare){
        return res.status(400).json({error: "Please login with correct credentials"})
      }

      const data= {
        user:{
          id: user.id
        }
      }

      
      const authtoken= jwt.sign(data, JWT_SECRET)
      success = true;
      res.json({success,authtoken})
    } catch (error) {
      console.log(error.message)
      res.status(500).send("Internal Server Error")
    }
  }
)


//ROUTE: 3 Authenticating user to login using: POST "/api/auth/getuser". Login require Authentication
router.post("/getuser", fetchuser,async(req, res)=>{
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password")  //(-password)-->exclude the password --- Fetching/finding user by ID from the DB
      res.send(user)
    } catch (error) {
      console.log(error.message)
      res.status(500).send("Internal Server Error")
    }
}
)

module.exports = router;

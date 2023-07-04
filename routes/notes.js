const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator"); //validating the data like min-length/max-lengthx
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");

//ROUTE : 1 Get All the Notes using: GET "/api/note/fetchallnotes". Login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error Occured ! ");
  }
});

//ROUTE :2 Add the Notes using: POST "/api/note/addnote". Login Required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter valid Title").isLength({ min: 3 }),
    body("description", "Enter a valid Description").isLength({ min: 5 }), //To avoid storing empty notes
  ],
  async (req, res) => {
    try {

      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);


    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error Occured ! ");
    }
  }
);

//ROUTE :3 Update the existing Notes using: PUT "/api/ntoe/updatenote". Login Required
router.put(
  "/updatenote/:id", fetchuser, async (req, res) => {
    try {
      
      const {title, description, tag} = req.body; //DESTRCTURING 
      //Create a new Note object
      let newNote = {};
      if (title){newNote.title = title};
      if(description){newNote.description = description};
      if(tag){newNote.tag = tag}; 

      //Find the note to be updated and update it
      let note = await Note.findById(req.params.id);
      if(!note){return res.status(404).send("Not Found !")};

      if(note.user.toString() !== req.user.id){ //verifying the logged-in user's id is same as the id of the note to be changed
        return res.status(401).send("Not Allowed  !!");
      }

      //Find the existing note and {set:}-->Update the parameters , {new:true}-->Return the update note when true, otherwise it'll return the note before update
      note = await Note.findByIdAndUpdate(req.params.id ,{$set: newNote}, {new: true});
      res.json({note});

    }  catch (error) {
      console.error(error.message);
      res.status(500).send("Some error Occured ! ");
    }
  }
)

//ROUTE :4 Delete the existing Notes using: DELETE "/api/note/deletenote". Login Required
router.delete(
  "/deletenote/:id", fetchuser, async (req, res) => {
    try { 

      //Find the note to be deleted and delete it
      let note = await Note.findById(req.params.id);
      if(!note){return res.status(404).send("Not Found !")};

      if(note.user.toString() !== req.user.id){ //verifying the logged-in user's id is same as the id of the note to be changed
        return res.status(401).send("Not Allowed  !!");
      }
      
      note = await Note.findByIdAndDelete(req.params.id);  //Find the note for the corresponding ID and Delete it.
      res.json({"Success": "The note has been deleted ", note:note});

    }  catch (error) {
      console.error(error.message);
      res.status(500).send("Some error Occured ! ");
    }
  }
)

module.exports = router;

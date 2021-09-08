//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_SERVER, {
  useNewUrlParser: true
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Post = mongoose.model("Post",postSchema);

const homeStartingContent = "Enter different posts using compose button below. You can edit or delete a post using the given buttons. The home page shows only 100 character entry of a post. ";
const aboutContent = "Hi, I am a Software Engineer with a BTech - Bachelor of Technology focused in Electronics and Telecommunications from College of Engineering Pune. Skilled in Java, javascript, python, C++, DSA, React.js, Node.js, Cascading Style Sheets (CSS), Full Stack Development, ML/DL, NLP, Management, Leadership.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
  Post.find({},function(err, posts){
    if(!err){
      res.render("home", {
        active:["active","",""],
        startingContent: homeStartingContent,
        posts: posts
        });
    }
  });
});

app.get("/about", function(req, res){
  res.render("about", {active:["","active",""],aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {active:["","","active"],contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose",{active:["","",""],action:"/compose",postTitle:"",content:""});
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: _.trimEnd(req.body.postTitle),
    content: req.body.postBody
  });

  post.save(function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/");
    }
  });

});

app.get("/posts/:postName", function(req, res){
  const requestedTitle = _.trimeEnd(req.params.postName);

  Post.findOne({title: requestedTitle },function(err,post){
    if(!err){
      if(post){
        console.log("No error in parametrised render.");
        res.render("post", {
          active:["","",""],
          title: post.title,
          content: post.content
        });
      }
    }
    else{
      console.log(err);
    }
  });
  });

app.post("/delete",function(req, res){
  const deleteTitle = _.trimEnd(req.body.delete);
  Post.deleteOne({title: deleteTitle}, function(err, post){
    if(err){
      console.log("Error in deleting post. ");
    }
    else if(!post){
      console.log("No such post found.");
    }
    else{
      console.log("Deleted Title:",deleteTitle);
      console.log("Post deleted.");
    }
  });
  res.redirect("/");
});

app.post("/edit",function(req,res){
  const editTitle = req.body.edit;
  console.log("Post to be edited: ",editTitle);
  Post.findOne({title:editTitle},function(err, post){
    if(err){
      console.log("Error in editing post.");
    }
    else if(!post){
      console.log("Post not found");
    }
    else{
      res.render('compose',{active:["","",""],action:"/edited",postTitle:post.title, content:post.content});
      console.log("Edit page setup successfull.");
    }
  });
});

app.post("/edited",function(req,res){
  const post = new Post({
    title: _.trimEnd(req.body.postTitle),
    content: req.body.postBody
  });

  const og_title = req.body.og_title;
  console.log("Post to be edited: ",og_title);
  Post.findOneAndReplace({title:og_title},{title: req.body.postTitle, content: req.body.postBody},null,function(err,og_post){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/");
      console.log("Post edited successfully.");
    }
});
});

app.listen(process.env.PORT || 3000, function(req, res) {
  console.log("Server started on port 3000");
});

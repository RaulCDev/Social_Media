# Todo list
---------------------------------
## First to do
  -SAVE THE AMOUNT OF VIEWS A POST HAVE
    -CHANGE THE /CARDS IN THE API TO RESPONSE WHIT THE CARDS THAT ARE IN THE DB
  -SAVE THE LIKES IN THE DATABASE
    -SAVE THE SINGULAR LIKE OFF THE USER AND THE AMOUNT OG LIKES IN TOTAL THE POST HAVE
  -SHOW THE AMOUNT OF LIKES, COMMENTS, VIEWS AND RETWEETS

  -DENIES THE ACCESS TO THE /HOME ROUTE IF THE USER ISN'T LOGGED

  -Add comments to the pots, see if it is better to have only one comment or to be able to contain comments within each other.
  -Make the icons of the post buttons to interact whit them
    -Save the likes when clicked
    -Save the reTweet when clicked
    -When clicked in the comment button, can write(Do the function to save it after)

## Front
  Right Part:
  -Finish the movement
  -Do better the input "Search" bar
  -Correct the positions of the buttons in the account cards

  Center Part:
  -The upper part of the post part need to be transparent when the posts move
  -Look for a way to have infinite scrolling in posts

  Left Part:
  -Correct the "More options" pop up
  -Add the user pop up when click

## ADD AT THE LAST
  Be able to watch the users profile

## FINISHED
=============================================================================================
  -THE API CANT VERIFY THE TOKEN(CANT CALL THE API WHEN IS PROTECTED) the part of github is almost finished but need to fix this part

  -CHANGE THE LOGIN METOD AND ONLY ALLOW GITHUB
   -CORRECT THE INSERT OF THE DATA WHEN THE USER LOGS, IF THE DATA ALREADY EXISTS DON INTRODUCE IT AGAIN
   -REGISTER THE USER IN THE DATABASE WHEN LOGGED WHIT GITHUB
   -CREATE A DIRECTION IN THE API TO REQUEST THE USER DATA

  -FINISH WHAT THE API DO WHEN STARTS (INTRODUCE THE FIRST 10 ACCOUNTS AND HIS POSTS TO HAVE CONTENT IN THE)
  -CHANGE THE USER MODEL, DELETE THE PASSWORD PARAMETER
  -DELETE THE REST OF THE CODE THAT USE THE LOGIN OF THE PAGE
  -Make the API to save the cards in the DB
  -MAKE THE MODELS OF THE TABLES TO BE ABLE TO RE USE "user = User.query.with_entities(User.id, User.email, User.username, User.accountName, User.avatarUrl).first()" FOR EXAMPLE

-Add the right part of the page
-Correct the position of the buttons and his content in the left part
-Add folders to order better components folder

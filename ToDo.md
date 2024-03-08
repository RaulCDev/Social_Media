# Todo list
---------------------------------
## First to do
  -CHANGE THE LOGIN METOD AND ONLY ALLOW GITHUB
  -DELETE THE REST OF THE CODE THAT USE THE LOGIN OF THE PAGE
  -DENI THE ACCES TO THE /HOME ROUTE IF THE USER ISN'T LOGED
  -MAKE SURE THAT THE LOGIN PART IS FINISHED
  -CHANGE THE USER MODEL, DELETE THE PASSWORD PARAMETER
  -FINISH WHAT THE API DO WHEN STARTS (INTRODUCE THE FIRST 10 ACCOUNTS AND HIS POSTS TO HAVE CONTENT IN THE)
  -MAKE THE MODELS OF THE TABLES TO BE ABLE TO RE USE "user = User.query.with_entities(User.id, User.email, User.username, User.accountname, User.avatarUrl).first()" FOR EXAMPLE

  -Make the direction of the API to save the cards in the DB
  -Make the direction of the API to save the likes, the user gives of which card
  -Make the icons of the post buttons to interact whit them
    -
## Front
  Right Part:
  -Finish the movement
  -Do better the imput "Search" bar
  -Correct the positions of the buttons in the account cards

  Center Part:
  -The upper part of the post part need to be transparent when the posts move
  -Look for a way to have infinite scrolling in posts

  Left Part:
  -Correct the "More options" pop up
  -Add the user pop up when click

## Back
  -Add likes to the posts, and save it in the user data in the database
  -Add comments to the pots, see if it is better to have only one comment or to be able to contain comments within each other.

## FINISHED
=============================================================================================

-Add the right part of the page
-Correct the position of the buttons and his content in the left part
-Add folders to order better components folder

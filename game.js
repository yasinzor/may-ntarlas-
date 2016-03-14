var w = 10
var h = 10
var snd = new Audio("explosion-01.wav");
var snd1=new Audio("applause-01.wav");
function openAll() {
  $("#field td").each(function () {
    cell = $(this)
    r = cell.data("row")
    c = cell.data("col")
    var val = field[r][c]
    if (val == "M") {
      if (cell.hasClass("mine")) {
        cell.css("background-color", "green");
		
      }
      else {
        cell.addClass("mine");
        cell.css("background-color", opened == toBeOpened ? "green" : "blue");
		
      }
    }
    else { // there is a number
      if (cell.hasClass("mine")) {
        cell.css("background-color", "red");
      }
      else if (! cell.data("opened") ) {
        cell.addClass("selected")
        var fname = "icons/number_" + val + ".png"
        cell.css("background-image", "url(" + fname + ")")
        cell.css("background-color", "pink");
		
      }
    }
    
  })
  $('#settings').show()
}

function openCell(cell) {
  r = cell.data("row")
  c = cell.data("col")
  var val = field[r][c]
  cell.addClass("selected")
  cell.data("opened", true)
  // cell.off("click")
  if (val >= 0) {
     opened++;
     console.log("opened: " + opened)
     if (opened == toBeOpened) { // game won
       alert("You WON")
	   snd1.play();
       openAll();
       $( "#tabs" ).tabs( "option", "active", 2 );
       return;
     }  
     if (val > 0) {
       // cell.html(val)
       var fname = "icons/number_" + val + ".png"
       cell.css("background-image", "url(" + fname + ")")
     }
  } 
}

function findNeighbors(row,col, radius) {
  if (radius == undefined) radius = 1
  var result = []
  for (var i=Math.max(0,row-radius); i<=Math.min(row+radius, h-1); i++) {
     for (var j=Math.max(0,col-radius); j<=Math.min(col+radius, w-1); j++) {
       if (i==row && j==col) continue;
       result.push([i,j])
     }
  }
  return result
}

function expand(r,c) {
 neighbors = findNeighbors(r,c)
 neighbors.forEach(function(coord) {
   row = coord[0]
   col = coord[1]
   trElem = $('#field tbody').children("tr").eq(row)
   // console.log(trElem.html())
   tdElem = trElem.children("td").eq(col)   
   if (tdElem.data("opened") || tdElem.hasClass("mine")) return;
   openCell(tdElem)
   var val = field[row][col]
   if (val == 0) {
     // setTimeout(function() { expand(row,col) }, 300)
     expand(row,col)     
   }
   
 })
}

function start() {
  var level = $("#level").val();
  // w = $("#w").val(); 
  // h = $("#h").val();
  w = $("#w").slider("value"); 
  h = $("#h").slider("value");
  console.log("w:" + w + "h:" + h) 
  field = new Array(h)
  for (i=0; i<h; i++) {
  	 field[i] = new Array(w)
  }
  var totalMine = Math.floor(w*h* (level == 1 ? 0.1 : (level == 2 ? 0.2 : 0.3)))
  $("#mineCount").progressbar({ max: totalMine, value: 0})

  // totalMine = 4;
  toBeOpened = w*h - totalMine; 
  opened = 0; 
  minesMarked = 0;
  var minesLocated = 0
  while (minesLocated < totalMine) {
  	 i = Math.floor(Math.random() * h) 
  	 j = Math.floor(Math.random() * w)
  	 if (field[i][j] != "M") {
  	 	field[i][j] = "M";
  	 	minesLocated++;
  	 }
  }  
  for (i=0; i<h; i++) {
  	 for (j=0; j<w; j++) {
  	   var minesFound = 0;
  	   if (field[i][j] == "M") continue;
           neighbors = findNeighbors(i,j)
           neighbors.forEach(function(coord) {
              row = coord[0]
              col = coord[1]
              if (field[row][col] == "M") minesFound++; 
           })
  	   field[i][j] = minesFound;
  	 }
  }
  tbody = $("#field tbody")
  tbody.children("tr").remove()
  for (i=0; i<h; i++) {
  	 row = $("<tr></tr>").appendTo(tbody)
  	 for (j=0; j<w; j++) {
  	 	cell = $("<td></td>").appendTo(row)
  	 	cell.html("&nbsp;")
  	 	// cell.html(field[i][j])
  	 	cell.data( {'row': i, 'col': j, 'opened': false} )
         }
  }
  $("#field").show()
  $("#settings").hide()
   $("#field").openAll()
}

var field;
var opened;
var toBeOpened;
var minesMarked;
$(document).ready(function() {

  $( "#tabs" ).tabs({ 
     show: "slideDown",
     beforeActivate: function( event, ui ) {
       // console.log(event);
       console.log(ui.newPanel.selector);
       if (ui.newPanel.selector == "#tabs-3") { // highscores tab
         /*
         $.ajax( {
            url: "scores.html",
         }).done(function( data ) {
            console.log(data);
            ui.newPanel.html(data);
         });
         */
         $.ajax( {
            url: "scores.php",
            dataType: "json",
            data: {limit: 9}
         }).done(function( data ) {
            var scoreList = $("#scores")
            for (key in data) {
              var str = key + ":" + data[key]
              scoreList.append("<li>" + str + "</li>")
            }
            console.log(data);
         });
       }
     }
  });

  $( ".slider").slider({ min: 5, max: 15, 
                         slide: function( event, ui ) {
                           // console.log(ui.handle)
		           $(ui.handle).html(ui.value );
			 } })
  $( ".slider").children(".ui-slider-handle").html(5)

  $('#start').click(function () { start(); })

  $("#field").on("contextmenu", "td", function(event) {
        var cell = $(this);
        if (cell.data("opened")) return;
        console.log("clicked")
	r = cell.data("row")
	c = cell.data("col")
        var val = field[r][c]
        if (val == "M") {
          alert("You LOST")
		  snd.play();
          openAll()
          return;
        }
        openCell(cell)
        if (val == 0) {
          expand(r,c)
        }
  })
  $("#field").on("click", "td", function(event) {
                  if (! $(this).data("opened")) {
                    if ($(this).hasClass("mine")) {
                       // $(this).html("&nbsp;")
                       $(this).removeClass("mine")
                       console.log("removed")
                       minesMarked--;
                       $("#mineCount").progressbar("option", "value", minesMarked )

                    }
                    else {
                       console.log("added")
                       // $(this).html(mineChar)
                       $(this).addClass("mine")
                       minesMarked++;
                       $("#mineCount").progressbar("option", "value", minesMarked )

                    }
                  }
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
  })

  	 	 
  // console.log(field)  
})

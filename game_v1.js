var w = 10
var h = 10
var mineChar = "&para;"
function openCell(cell) {
  r = cell.data("row")
  c = cell.data("col")
  var val = field[r][c]
  cell.addClass("selected")
  cell.data("opened", true)
  cell.off("click")
  if (val > 0) {
     cell.html(val)
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
   if (tdElem.data("opened")) return;
   openCell(tdElem)
   var val = field[row][col]
   if (val == 0) {
     // setTimeout(function() { expand(row,col) }, 300)
     expand(row,col)     
   }
   
 })
}

var field;
$(document).ready(function() {
  // setInterval("alert('hello')", 3000)
  // setTimeout("alert('hello')", 3000)
  // setTimeout(function() { alert('hello') }, 3000)
  var level = 1;
  field = new Array(h)
  for (i=0; i<w; i++) {
  	 field[i] = new Array(w)
  }
  var totalMine = w*h* (level == 1 ? 0.1 : (level == 2 ? 0.2 : 0.3))
  var minesLocated = 0
  while (minesLocated < totalMine) {
  	 i = Math.floor(Math.random() * w) 
  	 j = Math.floor(Math.random() * h)
  	 if (field[i][j] != "M") {
  	 	field[i][j] = "M";
  	 	minesLocated++;
  	 }
  }  
  for (i=0; i<w; i++) {
  	 for (j=0; j<h; j++) {
  	   var minesFound = 0;
  	   if (field[i][j] == "M") continue;
           neighbors = findNeighbors(i,j)
           neighbors.forEach(function(coord) {
              row = coord[0]
              col = coord[1]
              if (field[row][col] == "M") minesFound++; 
           })
           /*
  	   if (i>0 && j>0 && field[i-1][j-1] == "M") minesFound++; 
  	   if (i>0 && field[i-1][j] == "M") minesFound++; 
  	   if (i>0 && j<h-1 && field[i-1][j+1] == "M") minesFound++; 
  	   if (j>0 && field[i][j-1] == "M") minesFound++; 
  	   if (j<h-1 && field[i][j+1] == "M") minesFound++; 
  	   if (i < w-1 && j > 0 && field[i+1][j-1] == "M") minesFound++; 
  	   if (i < w-1 && field[i+1][j] == "M") minesFound++; 
  	   if (i < w-1 && j<h-1 && field[i+1][j+1] == "M") minesFound++; 
           */
  	   field[i][j] = minesFound;
  	 }
  }
  tbody = $("#field tbody")
  for (i=0; i<h; i++) {
  	 row = $("<tr></tr>").appendTo(tbody)
  	 for (j=0; j<w; j++) {
  	 	cell = $("<td></td>").appendTo(row)
  	 	cell.html("&nbsp;")
  	 	// cell.html(field[i][j])
  	 	cell.data( {'row': i, 'col': j, 'opened': false} )
  	 	cell.click(function() {
                        console.log("clicked")
                        $(this).off("click")
  	 		r = $(this).data("row")
  	 		c = $(this).data("col")
                        var val = field[r][c]
                        if (val == "M") alert("Exploded")
                        openCell($(this))
                        if (val == 0) {
                          expand(r,c)
                        }
  	 	})
                $(document).on("contextmenu", "td", function(event) {
                  if (! $(this).data("opened")) {
                    if ($(this).hasClass("mine")) {
                       $(this).html("&nbsp;")
                       $(this).removeClass("mine")
                       console.log("removed")
                    }
                    else {
                       console.log("added")
                       $(this).html(mineChar)
                       $(this).addClass("mine")
                    }
                  }
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                })

  	 	 
  	 }
  }
  // console.log(field)  
})

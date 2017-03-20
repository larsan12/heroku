var session;
var tree;
var cash;
var cashDeleted;

    function move() {
      var node = $('.right ul.tree li a.selected').parent("li").attr('id');
      var message = {
          session: session,
          node: node
      };
      $.ajax({
        type: "POST",
        dataType: 'json',
        url: '/move',
        data: message,
        success: function(res){
          clear(".left");
          cash = res.nodesCash;
          lockNode(node);
          drawAll(cash, ".left");
        }
      });
    };

    function rename() {
      var id =$('.left ul.tree li a.selected').parent("li").attr('id');
      if (!id) {
        alert("выберите узел")
        return;
      };
      var name = $('.left ul.tree li a.selected').text();
      var value = prompt("введиде новое значение value: " + name, "");
      if (!value) return;
      $.ajax({
        type: "POST",
        dataType: 'json',
        url: '/rename',
        data: {
          id: id,
          value: value,
          session: session
        },
        success: function(res){
          $('.left ul.tree li a.selected').text(value);
        }
      });
    };

    function deleteElement() {
      var id =$('.left ul.tree li a.selected').parent("li").attr('id');
      if (!id) {
        alert("выберите узел")
        return;
      };
      $.ajax({
        type: "POST",
        dataType: 'json',
        url: '/delete',
        data: {
          id: id,
          session: session
        },
        success: function(res){
          clear(".left");
          cash = res.nodesCash;
          drawAll(cash, ".left");
        }
      });
    };

    function add() {
      var id =$('.left ul.tree li a.selected').parent("li").attr('id');
      if (!id) {
        alert("выберите родителя")
        return;
      };
      var name = $('.left ul.tree li a.selected').text();
      var value = prompt("введиде значение value для нового узла (родиель: " + name + ") ", "");
      if (!value) return;
      $.ajax({
        type: "POST",
        dataType: 'json',
        url: '/add',
        data: {
          parent: id,
          value: value,
          session: session
        },
        success: function(res){
          drawNode(res.node, ".left");
        }
      });
    }

    function applyChanges() {
      $.ajax({
        type: "POST",
        dataType: 'json',
        data: {
          session: session
        },
        url: '/apply',
        success: function(res){
          tree = res.tree;
          array = res.array;
          clear(".right");
          clear(".left");
          drawNode(tree, ".right");
          cash = res.nodesCash;
          drawAll(cash, ".left");        }
      });
    };

    function reset() {
      $.ajax({
        type: "post",
        dataType: 'json',
        url: '/reset',
        data: {
          session: session
        },
        success: function(res){
          clear(".left");
          clear(".right");
          session = res.id;
          tree = res.tree;
          array = res.array;
          drawNode(tree, ".right");
        }
      });
    }

    function drawNode(node, side) {
      // side == ".left" or ".right"
      var func = "NodeSelection(this,'"+side+"')";
      if (node.parent && $(side).find("#" + node.parent).length) {
        var ctrl = $(side).find("#" + node.parent);
        if (ctrl.length) {
          if (ctrl.children("ul").length) {
            var nodeStr = "<li id=" + node.id +">";
            nodeStr += '<a style="margin-left:3px;" onclick="'+func+';">'+ 
            node.value + '</a>' + '</li>';
            ctrl.children("ul").append(nodeStr);
          } else {
            var nodeStr = "<ul> <li id=" + node.id +">";
            nodeStr += '<a style="margin-left:3px;" onclick="'+func+';">'+ 
            node.value + '</a>' + '</li> </ul>';
            ctrl.append(nodeStr);
          }
        } 
      } else {
        var nodeStr = "<li id=" + node.id +">";
        nodeStr += '<a style="margin-left:3px;" onclick="'+func+';">'+ 
        node.value + '</a>' + '</li>';
        $(side +" ul.tree").append(nodeStr);
      }

      if (node.locked) {
        lockNode(node.id);
      }

      if (node.deleted) {
        deleteNode(node.id, side);
      }

      if (node.branches && node.branches.length) {
        node.branches.forEach(n => {
          drawNode(n, side);
        })
      }
    }

    function drawAll(arr, side) {
      if (!arr) return;
      arr.forEach(node => {
        drawNode(node, side);
      })
    }

    function clear(side) {
      $(side + " .tree li").each(function(){$(this).remove()})
    }

    /*function NodeSelection(ctrl) {
      //$('ul.tree li').find('a').each(function () { $(this).removeClass(); })
      if ($(ctrl).hasClass("selected")) {
        $(ctrl).removeClass();
      } else {
        $(ctrl).addClass("selected");
      }
    }
*/
    function NodeSelection(ctrl, side) {
      if ($(ctrl).hasClass("selected")) {
        $(ctrl).removeClass();
      } else {
        $(side + ' ul.tree li .selected').each(function () { $(this).removeClass(); })
        $(ctrl).addClass("selected");
      }
    }

    function lockNode(id) {
      var ctrl = $(".right " + "#" + id + " a").first();
      $(ctrl).removeClass();
      $(ctrl).addClass("locked");
      $(ctrl).attr('onclick','').unbind('click');
    }

    function deleteNode(id, side) {
      var ctrl = $(side + " #" + id + " a").first();
      $(ctrl).removeClass();
      $(ctrl).addClass("deleted");
      $(ctrl).attr('onclick','').unbind('click');
    }

    $(document).ready(function () {

      $.ajax({
        type: "get",
        dataType: 'json',
        url: '/session',
        success: function(res){
          session = res.id;
          tree = res.tree;
          array = res.array;
          drawNode(tree, ".right");
        }
      });

      /*$('ul.tree li a').click(function (e) {
        $('ul.tree li').find('a').each(function () { $(this).removeClass(); })

        $(this).addClass("selected"); 
      });*/
    });
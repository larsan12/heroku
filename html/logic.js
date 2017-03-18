var session;
var tree;
var cash;
var cashDeleted;

    function move() {
      var arr = [];
      $('.right ul.tree li a.selected').each(function () { arr.push($(this).parent("li").attr('id')) })
      arr = arr.map(id => array.find(node => node.id==id));
      var message = {
          session: session,
          nodes: arr
      };
      $.ajax({
        type: "POST",
        dataType: 'json',
        url: '/move',
        data: message,
        success: function(res){
          clear(".left");
          cash = res.nodesCash;
          arr.forEach(n=> lockNode(n.id));
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
          clear(".left");
          clear(".right");
          drawNode(tree, ".right");
        }
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
      var func = side == ".right" ? "NodeSelection(this)" : "NodeSelectionLeft(this)";
      if (node.parent) {
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

      if (node.deleted) {
        deleteNode(node.id);
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

    function NodeSelection(ctrl) {
      //$('ul.tree li').find('a').each(function () { $(this).removeClass(); })
      if ($(ctrl).hasClass("selected")) {
        $(ctrl).removeClass();
      } else {
        $(ctrl).addClass("selected");
      }
    }

    function NodeSelectionLeft(ctrl) {
      if ($(ctrl).hasClass("selected")) {
        $(ctrl).removeClass();
      } else {
        $('.left ul.tree li .selected').each(function () { $(this).removeClass(); })
        $(ctrl).addClass("selected");
      }
    }

    function lockNode(id) {
      var ctrl = $(".right " + "#" + id + " a").first();
      $(ctrl).removeClass();
      $(ctrl).addClass("locked");
      $(ctrl).attr('onclick','').unbind('click');
    }

    function deleteNode(id) {
      var ctrl = $(".left " + "#" + id + " a").first();
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
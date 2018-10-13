(function generate() {
  // window.jQuery = window.jQuery;
  console.log(window.$,window.$("#skeduler-container"),window.$("#skeduler-container").skeduler);
  console.log("generate");
  var tasks = [];
  var places = ["第一体育館", "第二体育館", "購買前"]
  $.getJSON("https://kunugida2018.tokyo-ct.ac.jp/data/events.json", function(data) {
        console.log(data);
  });

  var data = [
    {
        "id": 0,
        "date": "21",
        "time": "2018/10/21/11:0:00",
        "display_time": "11.00",
        "duration": "1.00",
        "start_time": "11:0",
        "end_time": "12:0",
        "place": "購買前",
        "name": "ダンス",
        "content": "test",
        "from": "ダンス同好会",
        "tstamp": 1539360234
    },
    {
        "id": 1,
        "date": "21",
        "time": "2018/10/21/9:30:00",
        "display_time": "9.5",
        "duration": "2.16",
        "start_time": "9:30",
        "end_time": "11:10",
        "place": "第一体育館",
        "name": "吹奏楽",
        "content": "test",
        "from": "吹奏楽部",
        "tstamp": 1539360234
    },
    {
        "id": 2,
        "date": "21",
        "time": "2018/10/21/11:0:00",
        "display_time": "11.00",
        "duration": "1.66",
        "start_time": "11:0",
        "end_time": "12:40",
        "place": "第二体育館",
        "name": "ジャグリング",
        "content": "test",
        "from": "ジャグリング部",
        "tstamp": 1539360234
    },
    {
        "id": 3,
        "date": "21",
        "time": "2018/10/21/10:15:00",
        "display_time": "10.25",
        "duration": "0.75",
        "start_time": "10:15",
        "end_time": "11:0",
        "place": "第二体育館",
        "name": "ロボコン",
        "content": "test",
        "from": "ロボコン部",
        "tstamp": 1539360234
    },
    {
        "id": 4,
        "date": "21",
        "time": "2018/10/21/15:0:00",
        "display_time": "15.00",
        "duration": "1.00",
        "start_time": "15:0",
        "end_time": "16:0",
        "place": "第二体育館",
        "name": "吹奏楽",
        "content": "test",
        "from": "吹奏楽部",
        "tstamp": 1539360234
    },
    {
        "id": 5,
        "date": "20",
        "time": "2018/10/20/10:15:00",
        "display_time": "10.25",
        "duration": "0.75",
        "start_time": "10:15",
        "end_time": "11:00",
        "place": "第二体育館",
        "name": "ロボコン",
        "content": "test",
        "from": "ロボコン部",
        "tstamp": 1539360234
    },
    {
        "id": 6,
        "date": "20",
        "time": "2018/10/20/12:40:00",
        "display_time": "12.66",
        "duration": "0.84",
        "start_time": "12:40",
        "end_time": "13:30",
        "place": "第二体育館",
        "name": "ロボコン",
        "content": "test",
        "from": "ロボコン部",
        "tstamp": 1539360234
    },
    {
        "id": 7,
        "date": "21",
        "time": "2018/10/21/12:40:00",
        "display_time": "12.66",
        "duration": "0.84",
        "start_time": "12:40",
        "end_time": "13:30",
        "place": "第二体育館",
        "name": "ロボコン",
        "content": "test",
        "from": "ロボコン部",
        "tstamp": 1539360234
    },
    {
        "id": 8,
        "date": "20",
        "time": "2018/10/20/13:30:00",
        "display_time": "13.5",
        "duration": "1.50",
        "start_time": "13:30",
        "end_time": "15:00",
        "place": "第二体育館",
        "name": "ジャグリング",
        "content": "test",
        "from": "ジャグリング部",
        "tstamp": 1539360234
    },
    {
        "id": 9,
        "date": "20",
        "time": "2018/10/20/13:30:00",
        "display_time": "13.5",
        "duration": "2.50",
        "start_time": "13:30",
        "end_time": "16:00",
        "place": "第一体育館",
        "name": "軽音",
        "content": "test",
        "from": "軽音部",
        "tstamp": 1539360234
    },
    {
        "id": 10,
        "date": "21",
        "time": "2018/10/21/13:30:00",
        "display_time": "13.5",
        "duration": "1.50",
        "start_time": "13:30",
        "end_time": "15:0",
        "place": "第二体育館",
        "name": "ジャグリング",
        "content": "test",
        "from": "ジャグリング部",
        "tstamp": 1539360234
    },
    {
        "id": 11,
        "date": "20",
        "time": "2018/10/20/14:00:00",
        "display_time": "14.00",
        "duration": "1.50",
        "start_time": "14:00",
        "end_time": "15:30",
        "place": "購買前",
        "name": "ダンス",
        "content": "test",
        "from": "ダンス同好会",
        "tstamp": 1539360234
    },
    {
        "id": 12,
        "date": "20",
        "time": "2018/10/20/10:30:00",
        "display_time": "10.5",
        "duration": "1.00",
        "start_time": "10:30",
        "end_time": "11:30",
        "place": "第一体育館",
        "name": "吹奏楽",
        "content": "世界一周旅行をします！",
        "from": "吹奏楽部",
        "tstamp": 1539360234
    },
    {
        "id": 13,
        "date": "20",
        "time": "2018/10/20/15:00:00",
        "display_time": "15.00",
        "duration": "1.00",
        "start_time": "15:00",
        "end_time": "16:00",
        "place": "第二体育館",
        "name": "吹奏楽",
        "content": "test",
        "from": "吹奏楽部",
        "tstamp": 1539360234
    },
    {
        "id": 14,
        "date": "20",
        "time": "2018/10/20/10:0:00",
        "display_time": "10.00",
        "duration": "1.66",
        "start_time": "10:0",
        "end_time": "11:10",
        "place": "第一体育館",
        "name": "演劇部",
        "content": "test",
        "from": "演劇部",
        "tstamp": 1539360234
    },
    {
        "id": 15,
        "date": "21",
"time": "2018/10/21/13:0:00",
        "display_time": "13.00",
        "duration": "2.34",
        "start_time": "13:0",
        "end_time": "15:50",
        "place": "第一体育館",
        "name": "軽音",
        "content": "test",
        "from": "軽音部",
        "tstamp": 1539360234
    },
    {
        "id": 16,
        "date": "20",
        "time": "2018/10/20/11:00:00",
        "display_time": "11.00",
        "duration": "1.00",
        "start_time": "11:00",
        "end_time": "12:00",
        "place": "購買前",
        "name": "ダンス",
        "content": "test",
        "from": "ダンス同好会",
        "tstamp": 1539360234
    },
    {
        "id": 17,
        "date": "21",
        "time": "2018/10/21/14:0:00",
        "display_time": "14.00",
        "duration": "1.50",
        "start_time": "14:0",
        "end_time": "15:30",
        "place": "購買前",
        "name": "ダンス",
        "content": "test",
        "from": "ダンス同好会",
        "tstamp": 1539360234
    },
    {
        "id": 18,
        "date": "21",
        "time": "2018/10/21/11:25:00",
        "display_time": "11.67",
        "duration": "0.67",
        "start_time": "11:25",
        "end_time": "12:35",
        "place": "第一体育館",
        "name": "演劇",
        "content": "test",
        "from": "演劇部",
        "tstamp": 1539360234
    },
    {
        "id": 19,
        "date": "20",
        "time": "2018/10/20/11:00:00",
        "display_time": "11.00",
        "duration": "1.50",
        "start_time": "11:00",
        "end_time": "12:30",
        "place": "第二体育館",
        "name": "ジャグリング",
        "content": "test",
        "from": "ジャグリング部",
        "tstamp": 1539360234
    }
]
    var date = new Date();
    function getNow() {
        function to_string(d) {
            return (d < 10) ? '0' + d.toString() : d.toString();
        }
        var date = new Date();
        var now = `${to_string(date.getDay())}/${date.getHours()}:${date.getMinutes()}`
        console.log(now);
        return now;
    }
    var count=0;
    const get_schedule=(date)=>{
        tasks = [];
        if(count == 1 ){
          jQuery.noConflict(true);
        }
      count+=1;
      for (var i = 0; i < data.length; i++) {
          var columun = places.indexOf(data[i].place);
          console.log(columun);
          var task = {
              startTime: Math.round(data[i].display_time*100)/100,
              duration: Math.round(data[i].duration*100)/100,
              column: columun,
              from: data[i].from,
              time: data[i].start_time + "~" + data[i].end_time,
              title: data[i].name,
              content: data[i].content,
              width: 0
          };
          if(data[i].date==date){
              tasks.push(task);
          }
      }
      return tasks;
    }
    var tasks=get_schedule(21);
    set_tasks(tasks);
    function set_tasks(tasks) {
      jQuery("#skeduler-container").skeduler({
        headers: places,
        tasks: tasks,
        cardTemplate: '<div>${from}</div><div>${time}</div><div class="hide-content">${title}<br>${content}</div>',
        onClick: function (e, t) { console.log(e, t); }
      });
    }
    
    jQuery('#sche20').on('click',()=>{
      tasks = get_schedule(20);
      
      console.log(20);
      set_tasks(tasks);
  });
  jQuery('#sche21').on('click',()=>{ 
      tasks = get_schedule(21);
      //jQuery.noConflict(true)
      console.log(21);
      set_tasks(tasks);
  });
})(jQuery);

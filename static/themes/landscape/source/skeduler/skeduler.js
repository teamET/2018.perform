(function generate() {
    // window.jQuery = window.jQuery;
    console.log(window.$,window.$("#skeduler-container"),window.$("#skeduler-container").skeduler);
    console.log("generate");
    var tasks = [];
    var places = ["第一体育館", "第二体育館", "購買前"]
    $.getJSON("https://kunugida2018.tokyo-ct.ac.jp/data/events.json", function(data) {
        console.log(data);
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
            if(count == 2 ){
                //jQuery.noConflict(true);
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
            set_tasks(tasks);
        });
        jQuery('#sche21').on('click',()=>{ 
            tasks = get_schedule(21);
            set_tasks(tasks);
        });

    });

})(jQuery);

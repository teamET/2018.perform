var _showCategories = function(item) {
    for (var x = 0; x < item.length; ++x) {
        $(item[x]).fadeIn();
    }
};
var categories = [],
resources = [],
initial = "";
categories[0] = "#label0";
categories[1] = "#label1";
categories[2] = "#label2";
categories[3] = "#label3";
categories[4] = "#label4";
categories[5] = "#label5";
categories[6] = "#label6";
categories[7] = "#label7";
categories[8] = "#label8";
categories[9] = "#label9";
categories[10] = "#label10";
categories[11] = "#label11";
categories[12] = "#label12";
categories[13] = "#label13";

$('div.tags').find('input[type="checkbox"]').click(function() {
resources = [];
initial = "";
if ($('div.tags.categories input[type="checkbox"]:checked').length > 0) {
    $('.results shop').hide();
    
    $('.topics input[type="checkbox"]').removeAttr('disabled');
    

    $('div.tags').find('input:checked').each(function() {
    if (($.inArray($(this).attr('rel'), resources)) === -1) {
        resources.push($(this).attr('rel'));
    }
    
    
    initial = resources.toString();
    initial = initial.replace(/,/g, '.');
    });    
    
    for (var i = 0; i < categories.length; ++i) {
    if ($(categories[i] + " .results > shop." + initial).length != 0) {
        $(".results > shop." + initial).show('fast');
        $(categories[i]).fadeIn('fast');
    } else {
        $(categories[i]).fadeOut('fast');
    }
    }
} else {
    
    $('.topics input[type="checkbox"]').attr('disabled', 'disabled');
    $('.results > shop').fadeIn('fast');
    _showCategories(categories);
}
});
function search_shop() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("search_shop_input");
    filter = input.value.toUpperCase();
    table = document.getElementById("search_shop_table");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
function chview(event,view){
    var i,tabcontent,tablinks;
    tabcontent=document.getElementsByClassName("tabcontent");
    for(i=0;i<tabcontent.length;i++){
        tabcontent[i].style.display="none";
    }
    tablinks=document.getElementsByClassName("tablinks");
    for(i=0;i<tablinks.lenght;i++){
        tablinks[i].className=tablinks[i].className.replace(" active","");
    }
    document.getElementById(view).style.display="block";
    if(event){
        event.currentTarget.className+=" active";
    } 
}
chview(false,'Booth');
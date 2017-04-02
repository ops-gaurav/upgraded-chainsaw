/**
 * all the transitions related to admin.js page
 */

var id = 'appdrawer'
var drawer = {showing: false, rate: 300};

function toggleDrawer (drawerId) {
    if (drawer.showing) {
        $('#'+ id).animate ({width: 0+'px'}, drawer.rate, () => {
            drawer.showing = false;
            $('#'+ id).css ('display', 'none');
        });
        // $('#body-content').animate ({marginLeft: '0px'}, drawer.rate);
    } else {
        $('#'+ id).css ('display', 'block');
        $('#'+ id).animate ({width: 300+'px'}, drawer.rate, () => {
            drawer.showing = true;
        });

        // $('#body-content').animate ({marginLeft: '300px'}, drawer.rate);
    }
}
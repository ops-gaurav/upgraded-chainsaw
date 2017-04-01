/**
 * all the transitions related to admin.js page
 */

var drawer = {showing: false, rate: 300};

function toggleDrawer (drawerId) {
    if (drawer.showing) {
        $('#'+ drawerId).animate ({width: 0+'px'}, drawer.rate, () => {
            drawer.showing = false;
            $('#'+ drawerId).css ('display', 'none');
        });
        // $('#body-content').animate ({marginLeft: '0px'}, drawer.rate);
    } else {
        $('#'+ drawerId).css ('display', 'block');
        $('#'+ drawerId).animate ({width: 300+'px'}, drawer.rate, () => {
            drawer.showing = true;
        });

        // $('#body-content').animate ({marginLeft: '300px'}, drawer.rate);
    }
}
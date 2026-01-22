const users = { "MAX":"12345", "turki":"123123", "wedad":"12345" };
let currentUser = null;
document.getElementById('loginBtn').addEventListener('click', function(){
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if(users[u] && users[u]===p){
        currentUser = u;
        document.getElementById('loginDiv').style.display="none";
        document.getElementById('mapDiv').style.display="block";
        initMap();
    } else { document.getElementById('loginMsg').textContent="اسم المستخدم أو كلمة المرور خاطئة"; }
});

var hazardPoints = {};
var markers = {};
var reporting = false;

function getColor(count){ if(count===1) return "yellow"; else if(count<=6) return "orange"; else return "red"; }
function distance(lat1,lng1,lat2,lng2){ const R=6371000; const toRad = x=>x*Math.PI/180; const dLat = toRad(lat2-lat1); const dLng = toRad(lng2-lng1); const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2; const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R*c; }

function initMap(){
    const map = L.map('map').setView([25.6254570, 37.0837628], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map);

    document.getElementById('reportBtn').addEventListener('click', function(){
        reporting = true; alert("تم تفعيل وضع البلاغ. اضغط على أي مكان بالمطار لتسجيله.");
    });

    map.on('click', function(e){ if(!reporting) return; createOrUpdateMarker(e.latlng, map); reporting=false; });

    L.marker([25.6254570,37.0837628],{ icon:L.divIcon({ html:`<div class="site-marker">✈️ مطار البحر الأحمر</div>`, iconSize:[200,40], className:'' }) }).addTo(map);
}

function createOrUpdateMarker(latlng, map){
    var foundKey=null;
    for(var key in markers){
        var coords=key.split(","); var lat=parseFloat(coords[0]); var lng=parseFloat(coords[1]);
        if(distance(latlng.lat,latlng.lng,lat,lng)<=15){ foundKey=key; break; }
    }
    if(foundKey){
        hazardPoints[foundKey]++;
        var count=hazardPoints[foundKey];
        const el = markers[foundKey].getElement().querySelector('.alert-circle');
        if(el){ el.style.background=getColor(count); el.style.boxShadow=`0 0 20px ${getColor(count)}`; el.textContent=count; }
        markers[foundKey].bindPopup("Hazard Reports: "+count+" | بواسطة: "+currentUser);
    } else {
        var key = latlng.lat.toFixed(5)+","+latlng.lng.toFixed(5); hazardPoints[key]=1;
        var icon = L.divIcon({ className:'', html:`<div class="alert-circle" style="background:yellow; color:black;">1</div>`, iconSize:[30,30] });
        var marker = L.marker([latlng.lat,latlng.lng],{icon}).addTo(map);
        marker.bindPopup("Hazard Reports: 1 | بواسطة: "+currentUser); markers[key]=marker;
        marker.on('click', function(){ hazardPoints[key]++; var count=hazardPoints[key]; const el=marker.getElement().querySelector('.alert-circle'); if(el){ el.style.background=getColor(count); el.style.boxShadow=`0 0 20px ${getColor(count)}`; el.textContent=count; } marker.bindPopup("Hazard Reports: "+count+" | بواسطة: "+currentUser); });
    }
}

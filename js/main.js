// Başlangıçta kullanıcının konumuna erişmeliyiz. Bu sayede haritanın başlangıç konumunu belirleyeceğiz

import { personIcon } from "./constants.js";
import { getNoteIcon, getStatus } from "./helpers.js";
import elements from "./ui.js";


// Global Değişkenler
var map;
let clickedCoords;
let layer;


let notes = JSON.parse(localStorage.getItem("notes")) || [];

// Eğer `notes` yanlışlıkla bir obje olarak yüklenirse, onu diziye çevir
if (!Array.isArray(notes)) {
    notes = [];
}

// window içerisndeki navigator objesi içerisinde kullanıcının açmış olduğu sekme ile alakalı birçok veri bulunur.(koordinat,tarayıcı ile alakalı veriler, pc ile alakalı veriler) Biz de bu yapı içerisindeki geolocation yapısıyla kordinat verisine eriştik. Geolocation içerisindeki getCurrentPosition kullanıcının mevcut konumuna almak için kullanılır. Bu fonksiyon içerisine iki adt callBack fonk. ister. birincisi kullanıcının konumunu paylaşması, ikincisi paylaşmaması durumunda çalışır.
window.navigator.geolocation.getCurrentPosition(
    (e) => {
        loadMap([e.coords.latitude, e.coords.longitude], "Mevcut Konum")
    },
    (e) => {
        loadMap([39.923638, 32.836292], "Varsayılan Konum")
    })


//! Haritayı oluşturan fonksiyon
function loadMap(currentPosition, msg) {
    map = L.map('map', {
        zoomControl: false,
    }).setView(currentPosition, 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Zoom aracı konumu
    L.control.zoom({
        position: "bottomright",
    })
        .addTo(map)

    layer = L.layerGroup().addTo(map)

    // Kullanıcı ikonu
    L.marker(currentPosition, { icon: personIcon }).addTo(map).bindPopup(msg)

    // haritadaki tıklanma olaularını izle
    map.on("click", onMapClick)

    renderNotes() //Not renderlama
    renderMarkers() //marker renderlama
}

//! Haritaya tıklandığında tıklanan koordinatları alan fonk.
function onMapClick(e) {

    // tıklanan yerin koordinata eriş
    clickedCoords = [e.latlng.lat, e.latlng.lng];

    // Aside a add classı ekle çıkar
    elements.aside.classList.add("add")

}

//! Form gönderildiğinde çalışacak fonksiyon
elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = e.target[0].value
    const date = e.target[1].value
    const status = e.target[2].value

    // bir tane not objesi oluştur

    const newNote = {
        id: new Date().getTime(),
        title,
        date,
        status,
        coords: clickedCoords,
    };
    // Note dizisine yeni notu ekle
    notes.push(newNote)

    localStorage.setItem("notes", JSON.stringify(notes))

    // Formu resetle
    e.target.reset()


    // Aside ı eski haline döndür
    elements.aside.classList.remove("add")


    renderNotes() //* Notları render et
    renderMarkers() //*marker render et
});

//! Close btn e tıklanınca aside ı tekrardan eski haline çevir
elements.cancelBtn.addEventListener("click", () => {
    elements.aside.classList.remove("add")
})

//! Mevcut notları render eden fonksiyon
function renderNotes() {
    const noteCard = notes.map((note) => {

        // Tarih ayarlaması
        const date = new Date(note.date).toLocaleDateString("tr", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        })
        return `<li>
        <div>
              <p>${note.title}</p>
              <p>${date}</p>
              <p>${getStatus(note.status)}</p>
            </div>
        
            <div class="icons">
              <i data-id="${note.id}" class="bi bi-airplane-fill" id="fly-btn"></i>
              <i data-id="${note.id}" class="bi bi-trash" id="delete-btn"></i>
            </div>
          </li>`}).join("")


    // html yi arayüze ekle
    elements.noteList.innerHTML = noteCard

    //DELETE icon eriş
    document.querySelectorAll("#delete-btn").forEach((btn)=> {
        
        // Delete iconun data-id sine eriş
       const id = btn.dataset.id

        // Delete iconlara tıklanınca delete note fonk çalıştır
        btn.addEventListener("click", ()=> {
            deleteNote(id)
        })
    })

    //* Fly iconlara eriş
    document.querySelectorAll("#fly-btn").forEach((btn) => {

        btn.addEventListener("click", ()=>{
            
            const id = btn.dataset.id
            flyToNote(id)
        })
    })
}

document.addEventListener("DOMContentLoaded", () => {
    renderNotes()
    renderMarkers()
})

//! Markerları render eden fonksiyon
function renderMarkers() {
    layer.clearLayers()
    notes.map((note) => {

        // Eklenecek ikonun türüne karar ver
        const icon = getNoteIcon(note.status)


        // Note için marker oluştur
        L.marker(note.coords, { icon }).addTo(layer).bindPopup(note.title)
    })
}

//! Delete function
function deleteNote (id) {
    const res = confirm("Note silme işlemini onaylıyor musunuz ?")
     // Eğer kullanıcı onayladıysa
  if (res) {
    // İd'si bilinen not'u note dizisinden kaldır
    notes = notes.filter((note) => note.id != id); //!!! ÖNEMLİ

    // localestorage'ı güncelle
    localStorage.setItem("notes", JSON.stringify(notes));

    renderNotes()
    renderMarkers()

  }

}

//! Notlara focuslanan fonk
function flyToNote(id){

    // Id si bilinen notu note dizi içerisinde bul
    const foundedNote = notes.find((note)=> note.id == id)  

    // Butona focuslan
    map.flyTo(foundedNote.coords, 13)
}

// ArrowIcon fonksiyonu
elements.arrowIcon.addEventListener("click", ()=> {
    elements.aside.classList.toggle("hide")
})
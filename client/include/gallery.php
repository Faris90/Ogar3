<link href="assets/css/gallery.css" rel="stylesheet">
<div class="row center">
    <ul id="skinList">
            
        </ul>
</div>
 <script>
        // JSON dosyasını çek ve işle
        fetch('skinlist.json')
            .then(response => response.json())
            .then(data => {
                const skinList = document.getElementById('skinList');
                
                // Her bir skin için li oluştur ve ekle
                data.skins.forEach(skin => {
                    const li = document.createElement('li');
                    li.className = 'skin';
                    li.setAttribute('onclick', `setSkin(${skin.id})`);
                    li.setAttribute('data-dismiss', 'modal');
                    
                    li.innerHTML = `
                        <div class="circular" style='background-image: url("${skin.image}")'></div>
                        <h4 class="title">${skin.name}</h4>
                    `;

                    skinList.appendChild(li);
                });
            })
            .catch(error => console.error('Error loading skin list:', error));
    </script>

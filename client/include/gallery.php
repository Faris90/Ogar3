<link href="assets/css/gallery.css" rel="stylesheet">
<div class="row center">
    <ul>
        <!-- Aşağıdaki her bir <li> öğesi, bir PHP döngüsünün üretebileceği statik HTML'yi temsil eder -->
        <li class="skin" onclick="setSkin(2)" data-dismiss="modal">
            <div class="circular" style='background-image: url("/skins/doge.png")'></div>
            <h4 class="title">doge</h4>
        </li>
        <li class="skin" onclick="setSkin(1)" data-dismiss="modal">
            <div class="circular" style='background-image: url("/skins/doge.png")'></div>
            <h4 class="title">doge</h4>
        </li>
        <li class="skin" onclick="$('#nick').val($(this).find('.title').text());" data-dismiss="modal">
            <div class="circular" style='background-image: url("/skins/doge.png")'></div>
            <h4 class="title">doge</h4>
        </li>
        <!-- İstediğiniz kadar <li> öğesi ekleyebilirsiniz -->
    </ul>
</div>

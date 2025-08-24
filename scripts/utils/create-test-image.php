<?php
// Criar uma imagem PNG simples de teste
$width = 400;
$height = 300;

// Criar imagem
$image = imagecreatetruecolor($width, $height);

// Cores
$blue = imagecolorallocate($image, 100, 149, 237);
$white = imagecolorallocate($image, 255, 255, 255);

// Preencher fundo
imagefilledrectangle($image, 0, 0, $width, $height, $blue);

// Adicionar texto
$font_size = 5;
$text = "TESTE UPLOAD";
$text_width = imagefontwidth($font_size) * strlen($text);
$text_height = imagefontheight($font_size);
$x = ($width - $text_width) / 2;
$y = ($height - $text_height) / 2;
imagestring($image, $font_size, $x, $y, $text, $white);

// Salvar imagem
imagepng($image, 'test-upload.png');
imagedestroy($image);

echo "Imagem de teste criada com sucesso!\n";
echo "Tamanho: " . filesize('test-upload.png') . " bytes\n";
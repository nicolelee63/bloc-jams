var setSong = function(songNumber){
  if (currentSoundFile) {
    this.stop();
  }
  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber-1];
  //new buzz sound object
  //new settingds object w/2 properties   
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, { 
    formats: [ 'mp3' ],
    preload: true //load when the page loads. 
  });

  setVolume(currentVolume);
}; 

var seek = function(time) {
  if (currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};

var setVolume = function(volume) {
  if (currentSoundFile) {
    currentSoundFile.setVolume(volume);
  }
};


var getSongNumberCell = function(number) {
  var currentlyPlayingCell = $('.song-item-number[data-song-number="' + number + '"]');
  return currentlyPlayingCell;
};

var createSongRow = function(songNumber, songName, songLength) {
  songLength = filterTimeCode(songLength);
  var template =
    '<tr class="album-view-song-item">'
    + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    + '  <td class="song-item-title">' + songName + '</td>'
    + '  <td class="song-item-duration">' + songLength + '</td>'
    + '</tr>';
  
  var $row = $(template);

  var onHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt(songNumberCell.attr('data-song-number'));


    if (songNumber !== currentlyPlayingSongNumber) {
        songNumberCell.html(playButtonTemplate);
    }
    
    if ($(this).parent('.album-view-song-item')) {
      songNumberCell.innerHTML = playButtonTemplate;
      var songItem = this; //this row
      if (songItem.getAttribute('data-song-number') !== currentlyPlayingSongNumber) {

        $(this).find(songNumberCell).innerHTML = playButtonTemplate;
      }
    }
  };

  var offHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt(songNumberCell.attr('data-song-number'));

    if (songNumber !== currentlyPlayingSongNumber) {
        songNumberCell.html(songNumber);
    }
    if ($(this).parent('.album-view-song-item')) {
      songNumberCell.innerHTML = songNumber;
      var songItem = this; //this row 
      if (songItem.getAttribute('data-song-number') !== currentlyPlayingSongNumber) {
        $(this).find(songNumberCell).innerHTML = playButtonTemplate;
      }
    }
  };

  var clickHandler = function(event) {

    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt($(this).attr('data-song-number')); 

    if (currentlyPlayingSongNumber !== null) {
     //if there's a song playing
      var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
      currentlyPlayingCell.html(currentlyPlayingSongNumber);
    }
    if (currentlyPlayingSongNumber !== songNumber) {
        
        setSong(songNumber);
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
        currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    
        var $volumeFill = $('.volume .fill');
        var $volumeThumb = $('.volume .thumb');
        $volumeFill.width(currentVolume + '%');
        $volumeThumb.css({left: currentVolume + '%'});

        $(this).html(pauseButtonTemplate);
        updatePlayerBarSong();
        
    } else if (currentlyPlayingSongNumber === songNumber) {
        
      if (currentSoundFile.isPaused()) {
          
        $(this).html(pauseButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPauseButton);
        currentSoundFile.play();
          
      } else {
          
        $(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
        currentSoundFile.pause();
          
      }
    }
  };

  $row.find('.song-item-number').click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;
    
};
var $songRows = $('.album-view-song-item');

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  for (var i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration); 
    $albumSongList.append($newRow);
  }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);
  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
  var $seekBars = $('.player-bar .seek-bar');

  $seekBars.click(function(event) {
    // #3
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    // #4
    var seekBarFillRatio = offsetX / barWidth;
    // #5
    updateSeekPercentage($(this), seekBarFillRatio);
  });
  $seekBars.find('.thumb').mousedown(function(event) {
    // #8
    var $seekBar = $(this).parent();

    // #9
    $(document).bind('mousemove.thumb', function(event){
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;

      updateSeekPercentage($seekBar, seekBarFillRatio);
    });

    // #10
    $(document).bind('mouseup.thumb', function() {
      $(document).unbind('mousemove.thumb');
      $(document).unbind('mouseup.thumb');
    });
  });
  $seekBars.click(function(event) {
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;

    if ($(this).parent().attr('class') == 'seek-control') {
      seek(seekBarFillRatio * currentSoundFile.getDuration());
    } else {
      setVolume(seekBarFillRatio * 100);   
    }

    updateSeekPercentage($(this), seekBarFillRatio);
  });

  $seekBars.find('.thumb').mousedown(function(event) {

    var $seekBar = $(this).parent();

    $(document).bind('mousemove.thumb', function(event){
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;

      if ($seekBar.parent().attr('class') == 'seek-control') {
        seek(seekBarFillRatio * currentSoundFile.getDuration());   
      } else {
        setVolume(seekBarFillRatio);
      }
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
  });
}

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
  $('.main-controls .play-pause').html(playerBarPauseButton);
  setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentlyPlayingSong = null;
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSoundFile = null;
var currentSongFromAlbum = null;
var currentVolume = 20;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

var nextSong = function() {  
  var getLastSongNumber = function(index) {
    return (index == 0 ? currentAlbum.songs.length : index);
    //if index is 0, return the last song; 
    //otherwise, return the index
  };
  //the index of the current song
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  //increment the index
  currentSongIndex++;
  //if currentsongindex goes higher than the songs on the album, kick it back to 0 [the first song on the album]
  if (currentSongIndex >= currentAlbum.songs.length) {
    currentSongIndex = 0;
  }
  // Set a new current song number
  currentlyPlayingSongNumber = currentSongIndex + 1;
  // currentSoundFile.play();
  currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

  // Update the Player Bar information
  updatePlayerBarSong();

  var lastSongNumber = getLastSongNumber(currentSongIndex);
  //either returns index, or current album length.  
  //change the last song number/button template on the next song. 
  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

  $nextSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);   
};

var previousSong = function() {
  //this is the previous song, again. 
  var getLastSongNumber = function(index) {
    return (index == (currentAlbum.songs.length - 1) ? 1 : index + 2);
    //if index is the length of the album minus 1, return 1
    //otherwise, return index + 2
  };

  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  // decrement
  currentSongIndex--;

  if (currentSongIndex < 0) { //if currentsongindex is less than 0, 
    currentSongIndex = currentAlbum.songs.length - 1;
    //make it equal songs.length - 1
  }

  // Set a new current song
  setSong(currentSongIndex + 1);
  // currentSoundFile.play();

  // Update the Player Bar information
  updatePlayerBarSong();

  var lastSongNumber = getLastSongNumber(currentSongIndex);
  var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

  $previousSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);
    
};

var $mainControls = $(".main-controls .play-pause");

var toggleFromPlayerBar = function(){
  //if there's not a song playing
  if (currentSoundFile == null) {
    setSong(1);//play the first song
    currentSoundFile.play();

    $('.main-controls .play-pause').html(playerBarPauseButton);
    currentlyPlayingCell = getSongNumberCell(1);
    currentlyPlayingCell.html(pauseButtonTemplate);
  } else {
    //if there is a current soundfile and it's paused
    if (currentSoundFile.isPaused()) {
        currentSoundFile.play();
        $('.main-controls .play-pause').html(playerBarPauseButton);
        currentlyPlayingCell.html(pauseButtonTemplate);
    } else {
      //if there is a current soundfile and it's playing
      currentSoundFile.pause();
      $('.main-controls .play-pause').html(playerBarPlayButton);
      currentlyPlayingCell.html(playButtonTemplate);
    }
  } 
  // setCurrentTimeInPlayerBar();
};

var updateSeekBarWhileSongPlays = function() {
  if (currentSoundFile) {
    //#10
    currentSoundFile.bind('timeupdate', function(event) {
      // #11
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');

      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
  }
  setCurrentTimeInPlayerBar(seekBarFillRatio);
};

var setCurrentTimeInPlayerBar = function(currentTime){
  currentTime = filterTimeCode(currentTime);
  var currentTime = $(".current-time");
  currentTime.html(currentSoundFile.getTime()); //this is a Buzz method
}; 

var setTotalTimeInPlayerBar = function(totalTime) {
  totalTime = filterTimeCode(totalTime);
  var totalTime = $(".total-time");
  totalTime.html(currentSoundFile.getDuration()); //another buzz method. 
};
//
var filterTimeCode = function(timeInSeconds) {
  var numSeconds = Math.floor(parseFloat(timeInSeconds)); //round down the duration, convert it to a float
  var seconds = numSeconds % 60; //returns leftover seconds
  var minutes = (numSeconds - seconds)/60; //returns minutes
  if (seconds === 0) { //if we don't set :00, it'll just show :0 for full-minute songs, and that looks odd
    time = minutes + ":00"; 
  } else {
    time = minutes + ":" + seconds; 
  }
  console.log(time);
  return time;
}; 

$(document).ready(function(){
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $mainControls.click(toggleFromPlayerBar);
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
});
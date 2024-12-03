/** @format */
import { useState } from 'react';
import { useEvent } from 'expo';
import * as Animatable from 'react-native-animatable';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View, Button } from 'react-native';
import {
  FlatList,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

import { icons } from '../constants';

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1.1,
  },
  1: {
    scale: 0.9,
  },
};

const TrendingItem = ({ activeItem, item }) => {
  const player = useVideoPlayer(item.video, (player) => {
    player.loop = true;
    // player.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {isPlaying ? (
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
        />
      ) : (
        <TouchableOpacity
          style={styles.controlsContainer}
          title={isPlaying ? 'Pause' : 'Play'}
          onPress={() => {
            if (isPlaying) {
              player.pause();
            } else {
              player.play();
            }
          }}
        >
          <ImageBackground
            source={{
              uri: item.thumbnail,
            }}
            style={styles.ImageBackground}
            resizeMode="cover"
          />

          <Image
            source={icons.play}
            style={styles.Icons}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const Trending = ({ posts }) => {
  const [activeItem, setActiveItem] = useState(posts[0]);

  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };

  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170 }}
    />
  );
};

export default Trending;

const styles = StyleSheet.create({
  video: {
    width: 208,
    height: 288,
    borderRadius: 30,
    marginTop: 12,
  },
  controlsContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  ImageBackground: {
    width: 208,
    height: 288,
    borderRadius: 30,
    marginVertical: 20,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  Icons: {
    width: 48,
    height: 48,
    position: 'absolute',
  },
});

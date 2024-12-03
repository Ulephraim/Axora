/** @format */

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import React from 'react';
import { icons } from '../constants';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';

const VideoCard = ({
  video: {
    title,
    thumbnail,
    video,
    creator: { username, avatar },
  },
}) => {
  const player = useVideoPlayer(video, (player) => {
    player.loop = true;
    // player.play();
    // console.log(video);
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
        <View className="pt-2">
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>

      {isPlaying ? (
        <VideoView
          style={styles.video}
          resizeMode="contain"
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
            source={{ uri: thumbnail }}
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
    </View>
  );
};

export default VideoCard;

const styles = StyleSheet.create({
  video: {
    width: 208,
    height: 288,
    borderRadius: 30,
    marginTop: 12,
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlsContainer: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginTop: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  ImageBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    marginTop: 12,
  },
  Icons: {
    width: 48,
    height: 48,
    position: 'absolute',
  },
});

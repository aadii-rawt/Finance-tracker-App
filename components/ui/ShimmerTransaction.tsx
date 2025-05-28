// components/TransactionShimmer.js
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function TransactionShimmer() {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View style={styles.container}>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={styles.shimmerItem}>
          <View style={styles.avatar} />
          <View style={styles.textGroup}>
            <View style={styles.lineShort} />
            <View style={styles.lineLong} />
          </View>
          <View style={styles.amountBox} />
          <Animated.View
            style={[
              styles.shimmerOverlay,
              {
                transform: [{ translateX }],
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const shimmerColor = '#e0e0e0';

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  shimmerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    marginBottom: 16,
    padding: 10,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: shimmerColor,
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  lineShort: {
    width: '40%',
    height: 10,
    backgroundColor: shimmerColor,
    borderRadius: 4,
    marginBottom: 8,
  },
  lineLong: {
    width: '70%',
    height: 10,
    backgroundColor: shimmerColor,
    borderRadius: 4,
  },
  amountBox: {
    width: 60,
    height: 10,
    backgroundColor: shimmerColor,
    borderRadius: 4,
    marginLeft: 10,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff50',
    width: '50%',
    opacity: 0.5,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { usePitchDetector } from 'react-native-pitchy';

const PitchVisualizer = () => {
  const [pitch, setPitch] = useState(null);
  const [targetPitch, setTargetPitch] = useState(440); // Example target pitch (A4)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    pitchAccuracy: 0,
    noteDuration: 0,
    frequencyRange: [0, 0],
    pitchStability: 0,
    rhythmAccuracy: 0,
    progressOverTime: [],
    exerciseCompletion: 0,
    hapticFeedbackResponse: 0,
  });

  const { start, stop, isRecording } = usePitchDetector({
    onPitchDetected: (detectedPitch) => {
      setPitch(detectedPitch);
      updatePerformanceMetrics(detectedPitch);
      handleHapticFeedback(detectedPitch);
    },
  });

  useEffect(() => {
    const startPitchDetection = async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: true,
        staysActiveInBackground: true,
      });

      start();
    };

    startPitchDetection();

    return () => {
      stop();
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: false,
        shouldDuckAndroid: false,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    };
  }, []);

  const updatePerformanceMetrics = (detectedPitch) => {
    // Update performance metrics based on detected pitch
    // This is a placeholder implementation
    setPerformanceMetrics((prevMetrics) => ({
      ...prevMetrics,
      pitchAccuracy: Math.abs(detectedPitch - targetPitch),
      noteDuration: prevMetrics.noteDuration + 1,
      frequencyRange: [Math.min(prevMetrics.frequencyRange[0], detectedPitch), Math.max(prevMetrics.frequencyRange[1], detectedPitch)],
      pitchStability: prevMetrics.pitchStability + 1,
      rhythmAccuracy: prevMetrics.rhythmAccuracy + 1,
      progressOverTime: [...prevMetrics.progressOverTime, detectedPitch],
      exerciseCompletion: prevMetrics.exerciseCompletion + 1,
      hapticFeedbackResponse: prevMetrics.hapticFeedbackResponse + 1,
    }));
  };

  const handleHapticFeedback = (detectedPitch) => {
    if (Math.abs(detectedPitch - targetPitch) < 5) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (detectedPitch < targetPitch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pitchText}>Pitch: {pitch}</Text>
      <Text style={styles.targetPitchText}>Target Pitch: {targetPitch}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pitchText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  targetPitchText: {
    fontSize: 20,
    color: 'gray',
  },
});

export default PitchVisualizer;

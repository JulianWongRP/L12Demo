import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import { Audio } from 'expo-av';

const SENSITIVITY_THRESHOLD = 1.5; // Adjust sensitivity for shake detection
const COOLDOWN_TIME = 500; // Prevents spam triggering

export default function App() {
    const [shakeDetected, setShakeDetected] = useState(false);
    const [sound, setSound] = useState(null);
    const [soundType, setSoundType] = useState('drum'); // Default sound type
    const [lastShakeTime, setLastShakeTime] = useState(0);

    const soundFiles = {
        drum: require('./739781__looplicator__147-bpm-industrial-drum-loop-976-wav.wav'),
        cymbal: require('./269933__theriavirra__09_hat_open_cymbals__snares.wav'),
        bongo: require('./738098__sycopation__bongo_cowbell_clave_click-1.wav'),
    };

    useEffect(() => {
        let lastX = 0, lastY = 0, lastZ = 0;

        Gyroscope.setUpdateInterval(100);
        const subscription = Gyroscope.addListener(({ x, y, z }) => {
            const currentTime = Date.now();
            const rotationChange = Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);

            if (rotationChange > SENSITIVITY_THRESHOLD && currentTime - lastShakeTime > COOLDOWN_TIME) {
                setShakeDetected(true);
                playSound();
                setLastShakeTime(currentTime);
                setTimeout(() => setShakeDetected(false), 500);
            }

            lastX = x;
            lastY = y;
            lastZ = z;
        });

        return () => subscription.remove();
    }, [lastShakeTime]);

    async function playSound() {
        if (sound) {
            await sound.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync(soundFiles[soundType]);
        setSound(newSound);
        await newSound.playAsync();
    }

    return (
        <View style={styles.container}>
            {shakeDetected && <Text style={styles.shakeText}>SHAKE</Text>}
            <View style={styles.buttonContainer}>
                {Object.keys(soundFiles).map((type) => (
                    <TouchableOpacity key={type} style={styles.button} onPress={() => setSoundType(type)}>
                        <Text style={styles.buttonText}>{type.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
    },
    shakeText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        backgroundColor: '#444',
        padding: 10,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';

interface AnalogClockProps {
    size: number;
}

export function AnalogClock({ size = 200 }: AnalogClockProps) {
    const { colors, theme } = useTheme();
    const [date, setDate] = useState(new Date());

    // Handle ticking
    const secondOpacity = useSharedValue(1);

    // Tick effect for seconds hand
    useEffect(() => {
        secondOpacity.value = withRepeat(
            withDelay(
                0,
                withTiming(0.3, { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
            ),
            -1,
            true
        );

        const interval = setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Calculate hand angles
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    // Animated style for second hand
    const secondHandStyle = useAnimatedStyle(() => {
        return {
            opacity: secondOpacity.value,
            transform: [
                { translateY: -size * 0.3 },
                { rotateZ: `${secondAngle}deg` },
                { translateY: size * 0.3 },
            ],
        };
    });

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: theme === 'light' ? colors.card : colors.card,
                    borderColor: colors.border,
                },
            ]}
        >
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.hourMark,
                        {
                            width: i % 3 === 0 ? 4 : 2,
                            height: i % 3 === 0 ? 12 : 8,
                            backgroundColor: i % 3 === 0 ? colors.primary : colors.textSecondary,
                            transform: [
                                { translateY: -size / 2 + 6 },
                                { rotateZ: `${i * 30}deg` },
                                { translateY: size / 2 - 6 },
                            ],
                        },
                    ]}
                />
            ))}

            {/* Hour hand */}
            <View
                style={[
                    styles.hourHand,
                    {
                        height: size * 0.25,
                        width: 6,
                        borderRadius: 3,
                        backgroundColor: colors.text,
                        transform: [
                            { translateY: -size * 0.125 },
                            { rotateZ: `${hourAngle}deg` },
                            { translateY: size * 0.125 },
                        ],
                    },
                ]}
            />

            {/* Minute hand */}
            <View
                style={[
                    styles.minuteHand,
                    {
                        height: size * 0.4,
                        width: 4,
                        borderRadius: 2,
                        backgroundColor: colors.text,
                        transform: [
                            { translateY: -size * 0.2 },
                            { rotateZ: `${minuteAngle}deg` },
                            { translateY: size * 0.2 },
                        ],
                    },
                ]}
            />

            {/* Second hand */}
            <Animated.View
                style={[
                    styles.secondHand,
                    {
                        height: size * 0.4,
                        width: 2,
                        backgroundColor: colors.primary,
                    },
                    secondHandStyle,
                ]}
            />

            {/* Center cap */}
            <View
                style={[
                    styles.centerCap,
                    {
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        marginTop: -36,
                        backgroundColor: colors.primary,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    hourMark: {
        position: 'absolute',
        alignSelf: 'center',
        marginTop: 145
    },
    hourHand: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 2,
    },
    minuteHand: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 3,
    },
    secondHand: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 4,
    },
    centerCap: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 5,
    },
});

// export const AnalogClock = ({ size = 0 }) => <></>;
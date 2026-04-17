import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Svg, Polyline, Line, Text as SvgText, Circle } from 'react-native-svg';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';

interface DataPoint {
  label: string;
  value: number;
}

interface SalesChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showDots?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function SalesChart({
  data, height = 140, color = Colors.primary, showDots = true,
}: SalesChartProps) {
  const width = SCREEN_WIDTH - 64; // account for padding
  const paddingH = 20;
  const paddingV = 20;
  const chartWidth = width - paddingH * 2;
  const chartHeight = height - paddingV * 2;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const visibleData = data.filter(d => d.value > 0).length > 0 ? data : [];

  const getX = (i: number) => paddingH + (i / Math.max(data.length - 1, 1)) * chartWidth;
  const getY = (val: number) => paddingV + chartHeight - (val / maxValue) * chartHeight;

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');

  // Show labels only every N points to avoid clutter
  const labelStep = Math.ceil(data.length / 6);

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <Line
            key={i}
            x1={paddingH} y1={paddingV + chartHeight * (1 - ratio)}
            x2={paddingH + chartWidth} y2={paddingV + chartHeight * (1 - ratio)}
            stroke={Colors.border}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}

        {/* Line */}
        {visibleData.length > 1 && (
          <Polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Dots */}
        {showDots && data.map((d, i) => (
          <Circle
            key={i}
            cx={getX(i)}
            cy={getY(d.value)}
            r={d.value > 0 ? 4 : 2}
            fill={d.value > 0 ? color : Colors.border}
          />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) =>
          i % labelStep === 0 ? (
            <SvgText
              key={i}
              x={getX(i)}
              y={height - 4}
              fontSize="10"
              fill={Colors.textMuted}
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          ) : null
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
  },
});

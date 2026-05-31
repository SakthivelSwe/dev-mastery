package com.devmastery.ai.service;

import com.devmastery.ai.dto.HintRequest;
import com.devmastery.ai.dto.HintResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class HintService {

    public HintResponse getHint(HintRequest request) {
        log.info("Generating level {} hint for topic: {}", request.getHintLevel(), request.getTopicSlug());
        
        HintResponse response = new HintResponse();
        
        switch (request.getHintLevel()) {
            case 1:
                response.setHintText("Think about how you can use two variables to track the maximum and minimum values simultaneously as you iterate.");
                response.setXpCost(5);
                break;
            case 2:
                response.setHintText("Initialize your max and min variables with the first element of the array, not 0. What happens if all numbers in the array are negative?");
                response.setXpCost(15);
                break;
            case 3:
            default:
                response.setHintText("Use a single `for` loop starting from index 1. Inside the loop, check `if (nums[i] > max) max = nums[i];` and similarly for `min`.");
                response.setXpCost(30);
                break;
        }
        
        return response;
    }
}
